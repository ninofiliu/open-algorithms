import { useEffect, useRef, useState } from "react";
import { x } from "../../shared";
import fragmentSource from "./fragment.glsl?raw";
import vertexSource from "./vertex.glsl?raw";

const compile = (gl: WebGL2RenderingContext, type: number, source: string) => {
  const shader = x(gl.createShader(type));
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) ?? "shader compile error");
  }
  return shader;
};

const createGl = (canvas: HTMLCanvasElement) => {
  const gl = x(canvas.getContext("webgl2"));

  const vertex = compile(gl, gl.VERTEX_SHADER, vertexSource);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);

  const program = x(gl.createProgram());
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program) ?? "program link error");
  }
  gl.useProgram(program);

  const locations = {
    resolution: x(gl.getUniformLocation(program, "resolution")),
    currentCamFrame: x(gl.getUniformLocation(program, "currentCamFrame")),
    previousCamFrame: x(gl.getUniformLocation(program, "previousCamFrame")),
  };

  const dispose = () => {
    gl.deleteProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
  };

  return { gl, locations, dispose };
};

const openCamera = async () => {
  try {
    // prefer the environment (rear) camera when available
    return await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" } },
      audio: false,
    });
  } catch {
    return await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    });
  }
};

export const MotionCam = () => {
  const [error, setError] = useState(null as string | null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<ReturnType<typeof createGl> | null>(null);

  // the webgl context and program are built once
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const created = createGl(canvas);
    glRef.current = created;
    return () => {
      created.dispose();
      glRef.current = null;
    };
  }, []);

  // the camera stream starts as soon as the page loads, and the algorithm
  // restarts if the webgl context ever gets rebuilt
  useEffect(() => {
    const canvas = canvasRef.current;
    const created = glRef.current;
    if (!canvas || !created) return;
    const { gl, locations } = created;

    let cancelled = false;
    let raf = 0;
    let stream: MediaStream | null = null;
    const video = document.createElement("video");
    video.playsInline = true;
    video.muted = true;
    const textures: WebGLTexture[] = [];

    (async () => {
      try {
        stream = await openCamera();
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "camera access error");
        }
        return;
      }
      if (cancelled) {
        for (const track of stream.getTracks()) track.stop();
        return;
      }

      video.srcObject = stream;
      await video.play();
      if (video.videoWidth === 0) {
        await new Promise((resolve) => {
          video.onloadedmetadata = resolve;
        });
      }
      if (cancelled) return;

      const width = video.videoWidth;
      const height = video.videoHeight;
      canvas.width = width;
      canvas.height = height;
      gl.uniform2f(locations.resolution, width, height);
      gl.viewport(0, 0, width, height);

      const createTexture = (unit: number) => {
        const texture = x(gl.createTexture());
        textures.push(texture);
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        return texture;
      };

      // ping-pong between two textures/units: each frame, the new video frame
      // overwrites the one holding the oldest data, which becomes "current",
      // while the other one (holding the previous frame) is left untouched
      const frames = [createTexture(0), createTexture(1)];
      let currentUnit = 0;

      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

      const uploadFrame = (unit: number) => {
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, frames[unit]);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          video,
        );
      };

      // seed both textures with the first frame so the first diff is blank
      uploadFrame(0);
      uploadFrame(1);

      const frame = () => {
        if (cancelled) return;
        const previousUnit = currentUnit;
        currentUnit = 1 - currentUnit;
        uploadFrame(currentUnit);

        gl.uniform1i(locations.currentCamFrame, currentUnit);
        gl.uniform1i(locations.previousCamFrame, previousUnit);

        gl.drawArrays(gl.TRIANGLES, 0, 3);
        raf = requestAnimationFrame(frame);
      };
      frame();
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      video.pause();
      if (stream) for (const track of stream.getTracks()) track.stop();
      for (const texture of textures) gl.deleteTexture(texture);
    };
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {error && <p>Could not access the camera: {error}</p>}
      <canvas
        ref={canvasRef}
        style={{ maxWidth: "100%", objectFit: "contain" }}
      />
    </div>
  );
};
