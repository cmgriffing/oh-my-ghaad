"use client";

import { Badge, badgeVariants } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription } from "@/components/ui/card";
import { conferenceSchema, GAAD, talkSchema } from "@/utils/gaad";
import { useGHaaD } from "@oh-my-ghaad/react";
import dayjs from "dayjs";
import {
  Calendar,
  Ellipsis,
  MapPin,
  Pencil,
  PlusCircle,
  Trash,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { z } from "zod";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VariantProps } from "class-variance-authority";
import Case from "case";
import { Table, TableCell, TableRow } from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function Conference() {
  const router = useRouter();
  const { slug: conferenceId } = useParams();

  const [conference, setConference] =
    useState<z.infer<typeof conferenceSchema>>();
  const [talks, setTalks] = useState<
    Record<string, z.infer<typeof talkSchema>>
  >({});
  const [unproposedTalks, setUnproposedTalks] = useState<
    z.infer<typeof talkSchema>[]
  >([]);
  const [talkIdToBeAdded, setTalkIdToBeAdded] = useState<string>();
  const [ogImage, setOgImage] = useState<string>(
    "/conference-image-placeholder.png"
  );

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddTalkDialogOpen, setIsAddTalkDialogOpen] = useState(false);

  const { engine } = useGHaaD(GAAD);

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

    engine.fetchCollectionItems("talks").then((talks) => {
      const talkMap: Record<string, z.infer<typeof talkSchema>> = {};
      talks.forEach((talk) => {
        talkMap[talk.id] = talk;
      });
      setTalks(talkMap);
    });
  }, [conferenceId]);

  useEffect(() => {
    if (conference?.url) {
      fetch(`/api/conference/image`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conferenceUrl: conference?.url,
        }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch image");
          }
          return response.json();
        })
        .then((responseJson: { image: string }) => {
          setOgImage(responseJson.image);
        });
    }
  }, [conference?.url]);

  useEffect(() => {
    setUnproposedTalks(
      Object.values(talks).filter(
        (talk) => !conference?.proposedTalks.some((p) => p.id === talk.id)
      )
    );
  }, [conference?.proposedTalks.length, talks]);

  const isCfpActive = () => {
    const today = new Date();
    const cfpStart = conference?.cfpStartDate
      ? new Date(conference?.cfpStartDate)
      : new Date(0);
    const cfpEnd = new Date(conference?.cfpEndDate || 0);

    return cfpStart && today >= cfpStart && today <= cfpEnd;
  };

  const cfpStatus = isCfpActive() ? (
    <Badge
      variant="outline"
      className="bg-green-100 text-green-800 hover:bg-green-100"
    >
      CFP Active
    </Badge>
  ) : (
    <Badge
      variant="outline"
      className="bg-gray-100 text-gray-800 hover:bg-gray-100"
    >
      CFP Closed
    </Badge>
  );

  return (
    <>
      <Card>
        <CardContent className="flex flex-col gap-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex flex-col gap-8 md:w-1/2">
              <div className="flex flex-col">
                <div className="flex flex-row justify-between">
                  <div className="flex flex-row items-start gap-4">
                    <h1 className="text-4xl font-bold">{conference?.name}</h1>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant={"outline"}>
                        <Ellipsis className="h-6 w-6" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <a href={`/conferences/${conference?.id}/edit`}>
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
                <a
                  className="text-blue-500 underline"
                  href={conference?.url}
                  target="_blank"
                >
                  {conference?.url}
                </a>
                <CardDescription className="flex flex-row items-center gap-2">
                  {/* <p className="max-w-md">{conference?.description}</p> */}
                  <MapPin className="h-4 w-4" />
                  {conference?.location}
                </CardDescription>
              </div>
              <div className="flex flex-row gap-2 items-center">
                <Calendar className="h-4 w-4" />
                <p>
                  {conference?.startDate} - {conference?.endDate}
                </p>
              </div>

              <section className="flex flex-col gap-1">
                <h2 className="text-xl font-bold">Description</h2>
                <p className="max-w-md">{conference?.description}</p>
              </section>

              <section className="flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold">Call for Papers</h3>
                  {cfpStatus}
                </div>

                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="flex items-center mb-2">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span className="text-sm">
                      {conference?.cfpStartDate
                        ? dayjs(conference.cfpStartDate).format("MM/DD/YYYY")
                        : "N/A"}{" "}
                      - {dayjs(conference?.cfpEndDate).format("MM/DD/YYYY")}
                    </span>
                  </div>
                  {isCfpActive() && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      asChild
                      disabled={!isCfpActive()}
                    >
                      <a href={conference?.cfpUrl} target="_blank">
                        Submit a Proposal
                      </a>
                    </Button>
                  )}
                  {!isCfpActive() && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      disabled={true}
                    >
                      Submit a Proposal
                    </Button>
                  )}
                </div>
              </section>

              <section className="flex flex-col gap-4">
                <div className="flex flex-row items-center justify-between gap-2">
                  <h2 className="text-xl font-bold flex flex-row items-center gap-2">
                    Proposals
                    <Badge
                      variant={
                        conference?.proposedTalks.length === 0
                          ? "outline"
                          : "default"
                      }
                    >
                      {conference?.proposedTalks.length}
                    </Badge>
                  </h2>
                  <Button
                    onClick={() => {
                      setIsAddTalkDialogOpen(true);
                    }}
                  >
                    <PlusCircle className="h-6 w-6" />
                    <span className="sr-only">Add Talk</span>
                  </Button>
                </div>
                {conference?.proposedTalks.length !== 0 && (
                  <Table>
                    {conference?.proposedTalks.map((talk, talkIndex) => {
                      const talkDetails = talks[talk.id];
                      if (!talkDetails) {
                        return null;
                      }
                      return (
                        <TableRow
                          key={talk.id}
                          className="flex flex-row items-center justify-between gap-2"
                        >
                          <TableCell>
                            <div className="flex flex-row items-center gap-2">
                              <DropdownMenu>
                                <DropdownMenuTrigger>
                                  <ProposedTalkBadge talkStatus={talk.status} />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="center">
                                  {(
                                    [
                                      "pending",
                                      "proposed",
                                      "declined",
                                      "accepted",
                                    ] as const
                                  ).map((status) => {
                                    return (
                                      <DropdownMenuItem
                                        key={status}
                                        onClick={async () => {
                                          conference.proposedTalks =
                                            conference?.proposedTalks.map(
                                              (p) => {
                                                if (p.id === talk.id) {
                                                  return {
                                                    ...p,
                                                    status,
                                                  };
                                                }
                                                return p;
                                              }
                                            );

                                          await engine.updateInCollection(
                                            "conferences",
                                            conference.id!,
                                            conference
                                          );
                                        }}
                                      >
                                        {Case.capital(status)}
                                      </DropdownMenuItem>
                                    );
                                  })}
                                </DropdownMenuContent>
                              </DropdownMenu>
                              <span className="overflow-hidden text-ellipsis max-w-[300px]">
                                {talkDetails.title}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-row items-center gap-2">
                              <Button
                                variant={"destructive"}
                                onClick={async () => {
                                  if (conference?.proposedTalks.length === 0) {
                                    return;
                                  }
                                  conference.proposedTalks =
                                    conference?.proposedTalks.filter(
                                      (p) => p.id !== talk.id
                                    );
                                  await engine.updateInCollection(
                                    "conferences",
                                    conference.id!,
                                    conference
                                  );
                                }}
                              >
                                <Trash className="h-6 w-6" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </Table>
                )}
                {conference?.proposedTalks.length === 0 && (
                  <p className="text-center">No proposals submitted yet</p>
                )}
              </section>
            </div>
            <div className="hidden md:block md:w-1/2">
              <img src={ogImage} className="rounded-lg w-full h-auto" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Conference</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete the conference,{" "}
            <span className="font-bold">{conference?.name}</span>?
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
                setIsDeleteDialogOpen(false);
                router.push("/conferences");
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddTalkDialogOpen} onOpenChange={setIsAddTalkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Talk</DialogTitle>
          </DialogHeader>
          {!Boolean(unproposedTalks.length) && (
            <p>No talks available to add to this conference.</p>
          )}
          {Boolean(unproposedTalks.length) && (
            <Select value={talkIdToBeAdded} onValueChange={setTalkIdToBeAdded}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a talk" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {unproposedTalks.map((talk) => {
                    return (
                      <SelectItem key={talk.id} value={talk.id!}>
                        {talk.title}
                      </SelectItem>
                    );
                  })}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}

          <DialogFooter>
            <Button
              variant={"outline"}
              onClick={() => setIsAddTalkDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              disabled={!talkIdToBeAdded}
              onClick={async () => {
                if (!talkIdToBeAdded) {
                  return;
                }

                conference?.proposedTalks.push({
                  id: talkIdToBeAdded,
                  status: "pending",
                });

                await engine.updateInCollection(
                  "conferences",
                  conference?.id!,
                  conference
                );

                setTalkIdToBeAdded(undefined);
                setIsAddTalkDialogOpen(false);
              }}
            >
              Add Talk
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ProposedTalkBadge({
  talkStatus,
}: {
  talkStatus: z.infer<typeof conferenceSchema>["proposedTalks"][0]["status"];
}) {
  let variant: VariantProps<typeof badgeVariants>["variant"];

  switch (talkStatus) {
    case "pending":
      variant = "outline";
      break;
    case "proposed":
      variant = "default";
      break;
    case "declined":
      variant = "destructive";
      break;
    case "accepted":
      variant = "success";
      break;
  }

  return <Badge variant={variant}>{Case.capital(talkStatus)}</Badge>;
}
