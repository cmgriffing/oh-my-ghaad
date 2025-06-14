"use client";

import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { talkSchema } from "@/utils/gaad";
import { RequiredLabel } from "@/components/RequiredLabel";
import { useEffect } from "react";

export function TalkDetailsForm({
  talk,
  onSubmit,
  onCancel,
}: {
  talk?: z.infer<typeof talkSchema>;
  onSubmit: (values: z.infer<typeof talkSchema>) => void;
  onCancel: () => void;
}) {
  const form = useForm<z.infer<typeof talkSchema>>({
    resolver: zodResolver(talkSchema),
    defaultValues: {
      title: talk?.title || "",
      description: talk?.description || "",
      outline: talk?.outline || "",
      idealDurationMinutes: talk?.idealDurationMinutes || 0,
    },
  });

  useEffect(() => {
    if (talk) {
      form.setValue("title", talk.title);
      form.setValue("description", talk.description);
      form.setValue("outline", talk.outline);
      form.setValue("idealDurationMinutes", talk.idealDurationMinutes);
    }
  }, [talk]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardHeader>
          <CardTitle>Create Talk</CardTitle>
        </CardHeader>
        <CardContent>
          <div className=" flex flex-col space-y-4 px-4">
            <div className="flex flex-row items-start gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <RequiredLabel>Title</RequiredLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>The title of the talk.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="idealDurationMinutes"
                render={({ field }) => (
                  <FormItem className="w-[200px]">
                    <RequiredLabel>Duration</RequiredLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        min={0}
                        onChange={(event) => {
                          if (event.currentTarget.value) {
                            field.onChange(Number(event.currentTarget.value));
                          } else {
                            field.onChange(undefined);
                          }
                        }}
                      />
                    </FormControl>
                    <FormDescription>The ideal duration.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormDescription>
                    The description of the talk.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="outline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Outline</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormDescription>The outline of the talk.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-row gap-4 items-center justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </CardFooter>
      </form>
    </Form>
  );
}
