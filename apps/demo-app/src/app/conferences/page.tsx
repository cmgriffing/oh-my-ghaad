"use client";

import React, { useEffect, useState } from "react";
import { conferenceCollection, conferenceSchema, GAAD } from "@/utils/gaad";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Ellipsis,
  Info,
  Link,
  MapPin,
  Megaphone,
  Pencil,
  Pin,
  PlusCircle,
  Settings,
  Trash,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import dayjs from "dayjs";
import { Badge } from "@/components/ui/badge";
import clsx from "clsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGHaaD } from "@oh-my-ghaad/react";

export default function Conferences() {
  const [allConferences, setAllConferences] = useState<
    z.infer<(typeof conferenceCollection)["validator"]>[]
  >([]);
  const [pastConferences, setPastConferences] = useState<
    z.infer<(typeof conferenceCollection)["validator"]>[]
  >([]);
  const [upcomingConferences, setUpcomingConferences] = useState<
    z.infer<(typeof conferenceCollection)["validator"]>[]
  >([]);

  const GHAAD = useGHaaD(GAAD);

  const { engine } = GHAAD;

  // const [talks, setTalks] = useState<z.infer<typeof talkSchema>[]>([]);

  useEffect(() => {
    engine
      .fetchCollectionItems("conferences")
      .then((conferences: z.infer<typeof conferenceSchema>[]) => {
        setAllConferences(conferences);
        setPastConferences(
          conferences.filter((conference) =>
            dayjs(conference.startDate).isBefore(dayjs().endOf("day"))
          )
        );
        setUpcomingConferences(
          conferences.filter((conference) =>
            dayjs(conference.startDate).isAfter(dayjs().endOf("day"))
          )
        );
      });

    // GAAD.fetchCollectionItems("talks").then((talks) => {
    //   setTalks(talks);
    // });
  }, []);

  function onDelete(conference: z.infer<typeof conferenceSchema>) {
    return engine
      .removeFromCollection("conferences", conference.id)
      .then((conferences) => {
        setAllConferences(conferences);
      });
  }

  return (
    <div>
      <div className="flex flex-row items-center gap-4">
        <h1 className="text-2xl font-bold">Conferences</h1>
        <Button asChild>
          <a href="/conferences/new">
            <PlusCircle className="h-6 w-6" />
          </a>
        </Button>
      </div>

      <Tabs defaultValue="all" className="">
        <TabsList className="mx-auto mt-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <ConferenceList
            conferenceType=""
            conferences={allConferences}
            onDelete={onDelete}
          />
        </TabsContent>
        <TabsContent value="upcoming">
          <ConferenceList
            conferenceType="upcoming"
            conferences={upcomingConferences}
            onDelete={onDelete}
          />
        </TabsContent>
        <TabsContent value="past">
          <ConferenceList
            conferenceType="past"
            conferences={pastConferences}
            onDelete={onDelete}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ConferenceList({
  conferenceType,
  conferences,
  onDelete,
}: {
  conferenceType: "" | "upcoming" | "past";
  conferences: z.infer<typeof conferenceSchema>[];
  onDelete: (conference: z.infer<typeof conferenceSchema>) => void;
}) {
  return (
    <div className="w-full flex flex-row gap-4 flex-wrap">
      {!Boolean(conferences.length) && (
        <Card
          className={
            "w-full md:w-1/2 flex flex-col gap-4 mx-auto items-center justify-center"
          }
        >
          <p>
            No {conferenceType ? `${conferenceType} ` : ""}conferences found
          </p>
          <Button asChild>
            <a href="/conferences/new">Create Conference</a>
          </Button>
        </Card>
      )}
      {Boolean(conferences.length) && (
        <ul className="w-full flex flex-row flex-wrap">
          {conferences.map((conference, index) => (
            <li
              key={conference.id}
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
              <ConferenceCard conference={conference} onDelete={onDelete} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ConferenceCard({
  conference,
  onDelete,
}: {
  conference: z.infer<typeof conferenceSchema>;
  onDelete: (conference: z.infer<typeof conferenceSchema>) => void;
}) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <>
      <Card className="flex flex-col gap-0 p-4">
        <CardHeader className="p-0">
          <div className="flex flex-row items-center gap-2">
            <h3 className="text-xl font-bold">{conference.name}</h3>
            <Button
              asChild
              variant={"ghost"}
              className="text-blue-500 p-0 h-6 w-6"
            >
              <a href={conference.url} target="_blank">
                <Link className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex flex-row items-center gap-4 text-xs">
            <div className="text-gray-500 flex flex-row items-center gap-2">
              <Calendar className="h-4 w-4" />
              <p>{conference.startDate}</p>
              <p>to</p>
              <p>{conference.endDate}</p>
            </div>
            <div className="text-gray-500 flex flex-row items-center gap-2">
              <MapPin className="h-4 w-4" />
              <p>{conference.location}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="mt-4 p-0">
          <div className="flex flex-row gap-4 items-center justify-between w-full">
            <div className="">
              <ConferenceStatusBadge conference={conference} />
              <Badge
                className={clsx("mx-2", {
                  "border-red-500": conference.proposedTalks.length === 0,
                })}
                variant={"outline"}
              >
                <Megaphone className="h-6 w-6" />{" "}
                {conference.proposedTalks.length} Proposed{" "}
                {conference.proposedTalks.length === 1 ? "Talk" : "Talks"}
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
                    <a href={`/conferences/${conference.id}`}>
                      <Info className="h-6 w-6" />
                      Details
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a href={`/conferences/${conference.id}/edit`}>
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
            <DialogTitle>Delete Conference</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete the conference,{" "}
            <span className="font-bold">{conference.name}</span>?
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
                await onDelete(conference);
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

function ConferenceStatusBadge({
  conference,
}: {
  conference: z.infer<typeof conferenceSchema>;
}) {
  const hasAcceptedTalks = conference.proposedTalks.some(
    (talk) => talk.status === "accepted"
  );

  const hasDeclinedTalks = conference.proposedTalks.some(
    (talk) => talk.status === "declined"
  );

  const variant = hasAcceptedTalks
    ? "success"
    : hasDeclinedTalks
      ? "destructive"
      : "outline";

  const label = hasAcceptedTalks
    ? "Accepted"
    : hasDeclinedTalks
      ? "Declined"
      : "Pending";

  return <Badge variant={variant}>{label}</Badge>;
}
