/// <reference types="@rsbuild/core/types" />

interface ImportMetaEnv {
  // process.env.PUBLIC_FOO
  readonly PUBLIC_BACKEND_SERVICE: string;
  readonly PUBLIC_SUPPORT_NETWORKS: string;
  readonly PUBLIC_LIGHTHOUSE_API_KEY: string;
  readonly PUBLIC_IMGBB_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*.svg" {
  const content: string;
  export default content;
}
declare module "*.svg?react" {
  const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  export default ReactComponent;
}
