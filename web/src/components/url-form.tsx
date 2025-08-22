"use client";

import { useForm } from "react-hook-form";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "./ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link2 } from "lucide-react";

const formSchema = z.object({
  url: z.url(),
});

export function UrlForm() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/links`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to shorten URL");
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["links"] });
    },
    onError: (error) => {
      console.error("Error shortening URL:", error);
    },
  });
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
    },
    reValidateMode: "onSubmit",
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    mutation.mutate(values);
    form.reset( );
  }

  return (
    <Card className="max-w-3xl mx-auto">
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex items-center gap-4"
          >
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem className="flex-1 relative">
                  <FormLabel />
                  <FormControl>
                    <div className="relative w-full h-max flex items-center">
                      <Input
                        {...field}
                        autoComplete="off"
                        placeholder="https://www.example.com/your-long-url"
                      />
                    </div>
                  </FormControl>
                  <FormDescription />
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" size={"lg"}>
              Shorten Now
              <Link2 />
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
