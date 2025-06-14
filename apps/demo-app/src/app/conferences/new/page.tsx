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
import Conference from "../[slug]/page";
import { ConferenceDetailsForm } from "@/components/ConferenceDetailsForm";

export default function NewConference() {
  const router = useRouter();
  const { engine } = useGHaaD(GAAD);

  function onSubmit(values: z.infer<typeof conferenceSchema>) {
    engine.addToCollection("conferences", values).then((conferences) => {
      router.push("/conferences");
    });
  }

  return (
    <div>
      <Card className="max-w-[640px] mx-auto">
        <ConferenceDetailsForm
          onSubmit={onSubmit}
          onCancel={() => {
            router.back();
          }}
        />
      </Card>
    </div>
  );
}
