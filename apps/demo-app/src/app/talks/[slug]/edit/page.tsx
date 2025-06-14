"use client";

import { ConferenceDetailsForm } from "@/components/ConferenceDetailsForm";
import { TalkDetailsForm } from "@/components/TalkDetailsForm";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { talkSchema, GAAD } from "@/utils/gaad";
import { useGHaaD } from "@oh-my-ghaad/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { z } from "zod";

export default function EditTalk() {
  const router = useRouter();

  const { slug: talkId } = useParams();

  const { engine } = useGHaaD(GAAD);

  const [talk, setTalk] = useState<z.infer<typeof talkSchema>>();

  useEffect(() => {
    if (!talkId) {
      return;
    }

    engine.fetchCollectionItem("talks", talkId).then((talk) => {
      if (talk) {
        setTalk(talk);
      }
    });
  }, [talkId]);

  function onSubmit(values: z.infer<typeof talkSchema>) {
    if (talk?.id) {
      engine.updateInCollection("talks", talk.id, values).then((talks) => {
        router.back();
      });
    } else {
      // TODO: Show Error
    }
  }

  return (
    <div>
      <Card className="max-w-[640px] mx-auto">
        <TalkDetailsForm
          talk={talk}
          onSubmit={onSubmit}
          onCancel={() => {
            router.back();
          }}
        />
      </Card>
    </div>
  );
}
