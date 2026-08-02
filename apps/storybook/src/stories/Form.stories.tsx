import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from "@manovaspace/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useForm } from "react-hook-form";

const meta = {
  title: "Components/Form",
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

type DemoValues = { email: string };

export const WithValidation: Story = {
  render: () => {
    const form = useForm<DemoValues>({ defaultValues: { email: "" } });

    return (
      <Form {...form}>
        <form
          className="w-72 space-y-4"
          onSubmit={form.handleSubmit(() => undefined)}
        >
          <FormField
            control={form.control}
            name="email"
            rules={{
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Enter a valid email",
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} type="email" placeholder="you@example.com" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Continue</Button>
        </form>
      </Form>
    );
  },
};
