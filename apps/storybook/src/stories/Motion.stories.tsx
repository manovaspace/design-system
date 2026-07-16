import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  cn,
} from "@manovaspace/ui";
import {
  FadeIn,
  RevealOnScroll,
  SlideUp,
  staggerDelay,
  transitionBase,
} from "@manovaspace/ui/motion";
import { motion } from "framer-motion";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "Foundation/Motion",
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const FadeInStory: Story = {
  name: "FadeIn",
  render: () => (
    <FadeIn className="rounded-lg border bg-card p-6">
      <p className="text-sm text-muted-foreground">
        Fade + slight rise on mount. Uses shared <code>easeOut</code> tokens.
      </p>
    </FadeIn>
  ),
};

export const SlideUpStory: Story = {
  name: "SlideUp",
  render: () => (
    <SlideUp className="rounded-lg border bg-card p-6">
      <p className="text-sm text-muted-foreground">
        Stronger vertical offset than FadeIn — section entrances.
      </p>
    </SlideUp>
  ),
};

export const RevealOnScrollStory: Story = {
  name: "RevealOnScroll",
  render: () => (
    <div className="h-64 overflow-y-auto rounded-lg border p-4">
      <div className="h-32" />
      <RevealOnScroll className="rounded-lg border bg-muted/50 p-6">
        <p className="text-sm">Scroll down to reveal this block.</p>
      </RevealOnScroll>
      <div className="h-32" />
    </div>
  ),
};

export const StaggeredListStory: Story = {
  name: "Staggered list",
  render: () => (
    <div className="grid max-w-md grid-cols-2 gap-3">
      {["Alpha", "Beta", "Gamma", "Delta"].map((label, index) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transitionBase, delay: staggerDelay(index) }}
          className="rounded-md border bg-card px-4 py-3 text-sm"
        >
          {label}
        </motion.div>
      ))}
    </div>
  ),
};

export const MotionVsCssStory: Story = {
  name: "Framer vs CSS",
  render: () => (
    <div className="flex flex-wrap gap-6">
      <FadeIn className="w-48 rounded-lg border bg-card p-4 text-sm">
        <p className="font-medium">Framer (tier B)</p>
        <p className="mt-1 text-muted-foreground">FadeIn on mount</p>
      </FadeIn>
      <Dialog>
        <DialogTrigger
          className={cn(
            "inline-flex h-9 items-center justify-center rounded-md border px-4 text-sm",
          )}
        >
          Open dialog
        </DialogTrigger>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>CSS (tier A)</DialogTitle>
            <DialogDescription>
              Dialog overlay uses tw-animate / Radix animate-in classes.
            </DialogDescription>
          </DialogHeader>
          <Button variant="outline" size="sm">
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  ),
};

export const ReducedMotionNote: Story = {
  name: "Reduced motion",
  render: () => (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>prefers-reduced-motion</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        <p>
          Framer helpers respect the user&apos;s reduced-motion preference by
          default. Toggle reduced motion in your OS or browser devtools to
          verify. Complex product animations should also branch on{" "}
          <code>useReducedMotion()</code> from <code>@manovaspace/ui/motion</code>.
        </p>
      </CardContent>
    </Card>
  ),
};
