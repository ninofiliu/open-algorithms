export const x = <T>(value: T | null | undefined): T => {
  if (value == null) throw new Error("Value should not be nullish");
  return value;
};

export const picsSrc = [
  "/lib/07cf97cba3deebd020882f690554ba82.jpg",
  "/lib/09c778694da3baf50814376a0d2cef7b.jpg",
  "/lib/0c0ba82d2ae5558ae1d0d81170de23e6.jpg",
  "/lib/13020f767a6b963ac8f65e0f02cfdca4.jpg",
  "/lib/1973f637d18a83741fb835067e216895.jpg",
  "/lib/20103fd2633471e95d0c663426e52d16.jpg",
  "/lib/208ddcdde988a976df4fe458008a9c10.jpg",
  "/lib/224e3fe2f6f7db97eaade568964abff1.jpg",
  "/lib/23d57f62f5872e3fb4c61055f79eb27e.jpg",
  "/lib/30284897f92d643a7f4fa28e58760347.jpg",
  "/lib/35fc4a95ec9631e068ec47b9f2ebe75b.jpg",
  "/lib/369913234ae05c8fa2b93e3941caec25.jpg",
  "/lib/39fc97585e28a517788b66480ac811f9.jpg",
  "/lib/3effc2c60a82d3ac8958d6576b4d31bf.jpg",
  "/lib/3f6a245f65eba0b3bdbdbe49631f0b09.jpg",
  "/lib/40744e34e794452b386a30eb4264153f.jpg",
  "/lib/47f18b29fe9e44d7ea9d960332389158.jpg",
  "/lib/4ff55f0d84a2eb243a64ae51c37d5077.jpg",
  "/lib/5b1e543d5926a2a60527b09cc3bfb459.jpg",
  "/lib/5d7e4197efcf0f47f2cbb07fc1e9771f.jpg",
  "/lib/618ec16f0b4ebbf3c484696b56225bdf.jpg",
  "/lib/629cf4bc80b304a920a5baf94612e877.jpg",
  "/lib/675ace6cba9e6f0b85c67436654960b5.jpg",
  "/lib/6e6334f9d654f5811d9ce1af8541c490.jpg",
  "/lib/70588abd6d67b75bb208448b0b9dafb8.jpg",
  "/lib/742fac296d26fc4b41eb03680c3edc6f.jpg",
  "/lib/78784dc6707ce310ef2fbca45be8dc46.jpg",
  "/lib/8a18135a9fa5668339fc4cbd876e7af0.jpg",
  "/lib/8b3cbeea202a8413b7a77638ff0768ad.jpg",
  "/lib/8f6a4e3eac216088f01cd61d45d4d1b4.jpg",
  "/lib/900ef10f4c2a238dd065e5c09dafb57c.jpg",
  "/lib/9cce9dd44cce77175a99b49e628225ac.jpg",
  "/lib/9dca7f06b55bd5fc8c1ba47d026ab51d.jpg",
  "/lib/bc5cf160a6608c4aa075ba68ad7e6e42.jpg",
  "/lib/bcc7cb687e180de7536760fecd827f26.jpg",
  "/lib/be9244c515a7e8bbc13466a20ac6227f.jpg",
  "/lib/c5cd2d7f4fd9a5ee422a3b7b1817973d.jpg",
  "/lib/d8f63047ef785568739fe9824966d10b.jpg",
  "/lib/db10998d2b1c389b8bb46cc94b3c1a26.jpg",
  "/lib/de189f3c8245165e1908b3e569407a54.jpg",
  "/lib/e9bdde79683809d711785dfb8c1903d8.jpg",
  "/lib/fb366d5e8df8b1da927f2e51b2cbe035.jpg",
  "/lib/fffe08c8af25726a001f73ce900596a9.jpg",
  "/lib/grass.png",
];

export const randInt = (from: number, to: number) =>
  Math.floor(from + Math.random() * (to - from));

export const randPick = <T>(arr: T[]) => arr[randInt(0, arr.length)];
