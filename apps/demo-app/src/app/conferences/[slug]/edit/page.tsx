"use client";

import { ConferenceDetailsForm } from "@/components/ConferenceDetailsForm";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { conferenceSchema, GAAD } from "@/utils/gaad";
import { useGHaaD } from "@oh-my-ghaad/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { z } from "zod";

export default function EditConference() {
  const router = useRouter();

  const { slug: conferenceId } = useParams();

  const { engine } = useGHaaD(GAAD);

  const [conference, setConference] =
    useState<z.infer<typeof conferenceSchema>>();

  useEffect(() => {
    if (!conferenceId) {
      return;
    }

    engine
      .fetchCollectionItem("conferences", conferenceId)
      .then((conference) => {
        if (conference) {
          setConference(conference);
        }
      });
  }, [conferenceId]);

  function onSubmit(values: z.infer<typeof conferenceSchema>) {
    if (conference?.id) {
      engine
        .updateInCollection("conferences", conference.id, values)
        .then((conferences) => {
          router.back();
        });
    } else {
      // TODO: Show Error
    }
  }

  return (
    <div>
      <Card className="max-w-[640px] mx-auto">
        <ConferenceDetailsForm
          conference={conference}
          onSubmit={onSubmit}
          onCancel={() => {
            router.back();
          }}
        />
      </Card>
    </div>
  );
}
