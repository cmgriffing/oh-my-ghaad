"use client";

import { TalkDetailsForm } from "@/components/TalkDetailsForm";
import { Card } from "@/components/ui/card";
import { GAAD, talkSchema } from "@/utils/gaad";
import { useGHaaD } from "@oh-my-ghaad/react";
import { useRouter } from "next/navigation";
import { z } from "zod";

export default function NewTalk() {
  const router = useRouter();
  const { engine } = useGHaaD(GAAD);

  function onSubmit(values: z.infer<typeof talkSchema>) {
    engine.addToCollection("talks", values).then((talks) => {
      router.push("/talks");
    });
  }

  return (
    <div>
      <Card className="max-w-[640px] mx-auto">
        <TalkDetailsForm
          onSubmit={onSubmit}
          onCancel={() => {
            router.back();
          }}
        />
      </Card>
    </div>
  );
}
