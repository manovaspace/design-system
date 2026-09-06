import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  EmptyState,
  InformationCircleIcon,
} from "@manovaspace/ui";
import type { Meta } from "@storybook/react-vite";

const meta = {
  title: "Feedback/States",
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

export function AlertStates() {
  return (
    <div className="flex max-w-xl flex-col gap-4">
      <Alert>
        <AlertTitle>Saved</AlertTitle>
        <AlertDescription>Your changes are ready to review.</AlertDescription>
      </Alert>
      <Alert variant="success">
        <AlertTitle>Published</AlertTitle>
        <AlertDescription>The latest version is live.</AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <AlertTitle>Save failed</AlertTitle>
        <AlertDescription>Check the form and try again.</AlertDescription>
      </Alert>
    </div>
  );
}

export function EmptyResult() {
  return (
    <EmptyState
      icon={<InformationCircleIcon />}
      title="No projects yet"
      description="Create a project to start organizing your work."
      action={<Button>Create project</Button>}
    />
  );
}
