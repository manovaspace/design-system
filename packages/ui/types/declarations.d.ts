declare module "jsdom";
declare module "@storybook/react-vite" {
  export type Meta<T = unknown> = Record<string, unknown>;
  export type StoryObj<T = unknown> = Record<string, unknown>;
}
