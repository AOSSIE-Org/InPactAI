import React, { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Plane } from "ogl";

interface ThreadsProps extends React.ComponentPropsWithoutRef<"div"> {
  color?: [number, number, number];
  amplitude?: number;
  distance?: number;
  enableMouseInteraction?: boolean;
  maxDevicePixelRatio?: number;
}

const vertexShader = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragmentShader = `
precision highp float;

uniform float iTime;
uniform vec3 iResolution;
uniform vec3 uColor;
uniform float uAmplitude;
uniform float uDistance;
uniform vec2 uMouse;

#define PI 3.1415926538
const int U_LINE_COUNT = 20;
const float U_LINE_WIDTH = 7.0;
const float U_LINE_BLUR = 10.0;

float pixel(float count, vec2 resolution) {
    return (1.0 / max(resolution.x, resolution.y)) * count;
}

float hash21(vec2 p){
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

float fastNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash21(i + vec2(0.0,0.0));
    float b = hash21(i + vec2(1.0,0.0));
    float c = hash21(i + vec2(0.0,1.0));
    float d = hash21(i + vec2(1.0,1.0));
    vec2 u = f*f*(3.0-2.0*f);
    return mix(a, b, u.x) + (c - a)*u.y*(1.0 - u.x) + (d - b)*u.x*u.y;
}

float lineFn(vec2 st, float width, float perc, float offset, vec2 mouse, float time, float amplitude, float distance) {
    float split_offset = (perc * 0.4);
    float split_point = 0.1 + split_offset;

    float amplitude_normal = smoothstep(split_point, 0.7, st.x);
    float amplitude_strength = 0.5;
    float finalAmplitude = amplitude_normal * amplitude_strength
                           * amplitude * (1.0 + (mouse.y - 0.5) * 0.2);

    float time_scaled = time / 10.0 + (mouse.x - 0.5) * 1.0;
    float blur = smoothstep(split_point, split_point + 0.05, st.x) * perc;

    float xnoise = mix(
        fastNoise(vec2(time_scaled, st.x + perc) * 2.5),
        fastNoise(vec2(time_scaled, st.x + time_scaled) * 3.5) / 1.5,
        st.x * 0.3
    );

    float y = 0.5 + (perc - 0.5) * distance + (xnoise - 0.5) * finalAmplitude;

    float line_start = smoothstep(
        y + (width / 2.0) + (U_LINE_BLUR * pixel(1.0, iResolution.xy) * blur),
        y,
        st.y
    );

    float line_end = smoothstep(
        y,
        y - (width / 2.0) - (U_LINE_BLUR * pixel(1.0, iResolution.xy) * blur),
        st.y
    );

    return clamp(
        (line_start - line_end) * (1.0 - smoothstep(0.0, 1.0, pow(perc, 0.3))),
        0.0,
        1.0
    );
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;

    float line_strength = 1.0;
    for (int i = 0; i < U_LINE_COUNT; i++) {
        float p = float(i) / float(U_LINE_COUNT);
        line_strength *= (1.0 - lineFn(
            uv,
            U_LINE_WIDTH * pixel(1.0, iResolution.xy) * (1.0 - p),
            p,
            (PI * 1.0) * p,
            uMouse,
            iTime,
            uAmplitude,
            uDistance
        ));

        if (line_strength < 0.001) {
            break;
        }
    }

    float colorVal = 1.0 - line_strength;
    fragColor = vec4(uColor * colorVal, colorVal);
}

void main() {
    mainImage(gl_FragColor, gl_FragCoord.xy);
}
`;

const Threads: React.FC<ThreadsProps> = ({
  color = [1, 1, 1],
  amplitude = 1,
  distance = 0,
  enableMouseInteraction = false,
  maxDevicePixelRatio = 1.5,
  className,
  ...rest
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const programRef = useRef<Program | null>(null);
  const meshRef = useRef<Mesh | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const visibleRef = useRef(true);
  const mouseTargetRef = useRef<[number, number]>([0.5, 0.5]);
  const mouseCurrentRef = useRef<[number, number]>([0.5, 0.5]);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const renderer = new Renderer({ alpha: true });
    rendererRef.current = renderer;
    const gl = renderer.gl;

    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    container.appendChild(gl.canvas);

    const geometry = new Plane(gl, { width: 2, height: 2 });

    const program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new Float32Array([0, 0, 0]) },
        uColor: { value: new Float32Array(color) },
        uAmplitude: { value: amplitude },
        uDistance: { value: distance },
        uMouse: { value: new Float32Array([0.5, 0.5]) },
      },
    });

    programRef.current = program;
    meshRef.current = new Mesh(gl, { geometry, program });

    const resize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);

      const res = program.uniforms.iResolution.value as Float32Array;
      res[0] = renderer.width;
      res[1] = renderer.height;
      res[2] = w / h;
    };

    resize();
    window.addEventListener("resize", resize);

    const observer = new IntersectionObserver((entries) => {
      visibleRef.current = entries[0].isIntersecting;
    });
    observer.observe(container);

    const animate = (t: number) => {
      animationFrameRef.current = requestAnimationFrame(animate);

      if (!visibleRef.current) return;

      const m = program.uniforms.uMouse.value as Float32Array;
      m.set(mouseCurrentRef.current);

      program.uniforms.iTime.value = t * 0.001;

      renderer.render({ scene: meshRef.current! });
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      window.removeEventListener("resize", resize);
      observer.disconnect();
      if (container.contains(gl.canvas)) container.removeChild(gl.canvas);
      rendererRef.current = null;
      programRef.current = null;
      meshRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={className}
      {...rest}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        ...rest?.style,
      }}
    />
  );
};

export default Threads;
