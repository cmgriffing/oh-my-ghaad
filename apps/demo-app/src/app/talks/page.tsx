"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  conferenceSchema,
  GAAD,
  talkCollection,
  talkSchema,
} from "@/utils/gaad";
import { useGHaaD } from "@oh-my-ghaad/react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import clsx from "clsx";
import { Ellipsis, Info, Pencil, PlusCircle, Trash } from "lucide-react";
import { useEffect } from "react";
import { useState } from "react";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import {
  DialogHeader,
  DialogFooter,
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import router from "next/router";

export default function Talks() {
  const [talks, setTalks] = useState<z.infer<typeof talkSchema>[]>([]);
  const [conferences, setConferences] = useState<
    z.infer<typeof conferenceSchema>[]
  >([]);
  const [talkConferenceCountsMap, setTalkConferenceCountsMap] = useState<
    Record<string, number>
  >({});

  const { engine } = useGHaaD(GAAD);

  useEffect(() => {
    engine
      .fetchCollectionItems("talks")
      .then((talks: z.infer<typeof talkSchema>[]) => {
        setTalks(talks);
      });

    engine.fetchCollectionItems("conferences").then((conferences) => {
      setConferences(conferences);
    });
  }, []);

  useEffect(() => {
    const talkConferenceCountsMap: Record<string, number> = {};

    talks.forEach((talk) => {
      if (talk.id) {
        talkConferenceCountsMap[talk.id] = 0;
      }
    });

    conferences.forEach((conference) => {
      conference.proposedTalks.forEach((talk) => {
        talkConferenceCountsMap[talk.id] = talkConferenceCountsMap[talk.id] + 1;
      });
    });

    setTalkConferenceCountsMap(talkConferenceCountsMap);
  }, [talks, conferences]);

  function onDelete(talk: z.infer<typeof talkSchema>) {
    return engine.removeFromCollection("talks", talk.id).then((talks) => {
      setTalks(talks);
    });
  }

  return (
    <div>
      <div className="flex flex-row items-center gap-4">
        <h1 className="text-2xl font-bold">Talks</h1>
        <Button asChild>
          <a href="/talks/new">
            <PlusCircle className="h-6 w-6" />
          </a>
        </Button>
      </div>

      {!Boolean(talks.length) && (
        <Card
          className={
            "w-full md:w-1/2 flex flex-col gap-4 mx-auto items-center justify-center"
          }
        >
          <p>No talks found</p>
          <Button asChild>
            <a href="/talks/new">Create Talk</a>
          </Button>
        </Card>
      )}

      {Boolean(talks.length) && (
        <ul className="w-full flex flex-row flex-wrap mt-8">
          {talks.map((talk, index) => (
            <li
              key={talk.id}
              className={clsx("w-full md:w-1/2 xl:w-1/3 2xl:w-1/4 pb-2", {
                "md:pr-2": index % 2 === 0,
                "md:pl-2": index % 2 === 1,
                "xl:pr-2": index % 3 === 0,
                "xl:px-2": index % 3 === 2,
                "xl:pl-2": index % 3 === 1,
                "2xl:pr-2": index % 4 === 0,
                "2xl:px-2": index % 4 === 1 || index % 4 === 2,
                "2xl:pl-2": index % 4 === 3,
              })}
            >
              <TalkCard
                talk={talk}
                onDelete={onDelete}
                conferenceCount={talkConferenceCountsMap[talk.id!]}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function TalkCard({
  talk,
  onDelete,
  conferenceCount,
}: {
  talk: z.infer<typeof talkSchema>;
  onDelete: (talk: z.infer<typeof talkSchema>) => void;
  conferenceCount: number;
}) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <>
      <Card className="flex flex-col gap-0 p-4">
        <CardHeader className="p-0">
          <div className="flex flex-row items-center gap-2">
            <h3 className="text-xl font-bold">{talk.title}</h3>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <p>
            {talk.description.length > 100
              ? talk.description.slice(0, 100) + "..."
              : talk.description}
          </p>
        </CardContent>
        <CardFooter className="mt-4 p-0">
          <div className="flex flex-row gap-4 items-center justify-between w-full">
            <div className="">
              <Badge
                variant="outline"
                className={clsx({
                  "border-red-500": conferenceCount === 0,
                  "border-green-500": conferenceCount > 0,
                })}
              >
                {conferenceCount} Conferences
              </Badge>
            </div>
            <div className="flex flex-row gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button>
                    <Ellipsis className="h-6 w-6" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <a href={`/talks/${talk.id}`}>
                      <Info className="h-6 w-6" />
                      Details
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a href={`/talks/${talk.id}/edit`}>
                      <Pencil className="h-6 w-6" />
                      Edit
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => {
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <Trash className="h-6 w-6" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardFooter>
      </Card>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Talk</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete the talk,{" "}
            <span className="font-bold">{talk?.title}</span>?
          </p>
          <DialogFooter>
            <Button
              variant={"outline"}
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                await onDelete(talk);
                setIsDeleteDialogOpen(false);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
