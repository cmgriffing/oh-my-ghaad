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
import { conferenceSchema, GAAD } from "@/utils/gaad";
import { RequiredLabel } from "@/components/RequiredLabel";
import { useGHaaD } from "@oh-my-ghaad/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function ConferenceDetailsForm({
  conference,
  onSubmit,
  onCancel,
}: {
  conference?: z.infer<typeof conferenceSchema>;
  onSubmit: (values: z.infer<typeof conferenceSchema>) => void;
  onCancel: () => void;
}) {
  const form = useForm<z.infer<typeof conferenceSchema>>({
    resolver: zodResolver(conferenceSchema),
    defaultValues: {
      name: conference?.name || "",
      url: conference?.url || "",
      startDate: conference?.startDate || "",
      endDate: conference?.endDate || "",
      location: conference?.location || "",
      description: conference?.description || "",
      cfpStartDate: conference?.cfpStartDate || "",
      cfpEndDate: conference?.cfpEndDate || "",
      cfpUrl: conference?.cfpUrl || "",
      proposedTalks: conference?.proposedTalks || [],
    },
  });

  useEffect(() => {
    if (conference) {
      form.setValue("name", conference.name);
      form.setValue("url", conference.url);
      form.setValue("startDate", conference.startDate);
      form.setValue("endDate", conference.endDate);
      form.setValue("location", conference.location);
      form.setValue("description", conference.description);
      form.setValue("cfpStartDate", conference.cfpStartDate);
      form.setValue("cfpEndDate", conference.cfpEndDate);
      form.setValue("cfpUrl", conference.cfpUrl);
      form.setValue("proposedTalks", conference.proposedTalks);
    }
  }, [conference]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardHeader>
          <CardTitle>Create Conference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className=" flex flex-col space-y-4 px-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <RequiredLabel>Name</RequiredLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>The name of the conference.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <RequiredLabel>URL</RequiredLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>The URL of the conference.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-row items-start gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <RequiredLabel>Start Date</RequiredLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      The start date of the conference.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <RequiredLabel>End Date</RequiredLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      The end date of the conference.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <RequiredLabel>Location</RequiredLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    The location of the conference.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                    The description of the conference.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-row items-start gap-4">
              <FormField
                control={form.control}
                name="cfpStartDate"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>CFP Start Date</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      The start date of the conference call for proposals.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cfpEndDate"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <RequiredLabel>CFP End Date</RequiredLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      The end date of the conference call for proposals.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="cfpUrl"
              render={({ field }) => (
                <FormItem>
                  <RequiredLabel>CFP URL</RequiredLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    The URL of the conference call for proposals.
                  </FormDescription>
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
