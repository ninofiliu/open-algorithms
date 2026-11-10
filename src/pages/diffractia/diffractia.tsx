import { useEffect, useRef, useState } from "react";
import { x } from "../../shared";
import { FileInput } from "../../components/FileInput";
import fragmentSource from "../../scratch/fragment.glsl?raw";
import vertexSource from "../../scratch/vertex.glsl?raw";

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
    step: x(gl.getUniformLocation(program, "step")),
    img1: x(gl.getUniformLocation(program, "img1")),
    img2: x(gl.getUniformLocation(program, "img2")),
    previous: x(gl.getUniformLocation(program, "previous")),
  };

  const dispose = () => {
    gl.deleteProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
  };

  return { gl, locations, dispose };
};

type Gl = ReturnType<typeof createGl>;

const loadImage = async (file: File) => {
  const img = document.createElement("img");
  const url = URL.createObjectURL(file);
  img.src = url;
  try {
    await img.decode();
  } finally {
    URL.revokeObjectURL(url);
  }
  return img;
};

export const Diffractia = () => {
  const [source, setSource] = useState(null as File | null);
  const [diffraction, setDiffraction] = useState(null as File | null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<Gl | null>(null);

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

  // the algorithm restarts whenever an image changes
  useEffect(() => {
    if (!source || !diffraction) return;
    const canvas = canvasRef.current;
    const created = glRef.current;
    if (!canvas || !created) return;
    const { gl, locations } = created;

    let cancelled = false;
    let raf = 0;
    const textures: WebGLTexture[] = [];

    (async () => {
      const [img1, img2] = await Promise.all([
        loadImage(source),
        loadImage(diffraction),
      ]);
      if (cancelled) return;

      const width = img1.width;
      const height = img1.height;
      canvas.width = width;
      canvas.height = height;
      gl.uniform2f(locations.resolution, width, height);
      gl.viewport(0, 0, width, height);

      const createTexture = (
        unit: number,
        location: WebGLUniformLocation,
        upload: () => void,
      ) => {
        const texture = x(gl.createTexture());
        textures.push(texture);
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        upload();
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.uniform1i(location, unit);
      };

      const previousUnit = 0;
      createTexture(previousUnit, locations.previous, () => {
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          width,
          height,
          0,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          null,
        );
      });

      createTexture(1, locations.img1, () => {
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          img1,
        );
      });

      createTexture(2, locations.img2, () => {
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          img2,
        );
      });

      let step = 0;
      const frame = () => {
        if (cancelled) return;
        gl.uniform1i(locations.step, step++);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        // copyTexImage2D targets the texture bound on the active unit, so select "previous" explicitly
        gl.activeTexture(gl.TEXTURE0 + previousUnit);
        gl.copyTexImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 0, 0, width, height, 0);
        raf = requestAnimationFrame(frame);
      };
      frame();
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      for (const texture of textures) gl.deleteTexture(texture);
    };
  }, [source, diffraction]);

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <FileInput label="Source image" onChange={setSource} />
      <FileInput label="Diffraction image" onChange={setDiffraction} />
      <canvas
        ref={canvasRef}
        style={{ maxWidth: "100%", objectFit: "contain" }}
      />
    </div>
  );
};
