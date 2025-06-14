"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DialogHeader,
  DialogFooter,
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenuTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { conferenceSchema, GAAD, talkSchema } from "@/utils/gaad";
import { useGHaaD } from "@oh-my-ghaad/react";
import { Ellipsis, Info, Pencil, Trash } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { z } from "zod";

export default function Talk() {
  const router = useRouter();
  const { slug: talkId } = useParams();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { engine } = useGHaaD(GAAD);

  const [talk, setTalk] = useState<z.infer<typeof talkSchema>>();
  const [conferences, setConferences] = useState<
    z.infer<typeof conferenceSchema>[]
  >([]);

  useEffect(() => {
    if (!talkId) {
      return;
    }

    engine.fetchCollectionItem("talks", talkId).then((talk) => {
      if (talk) {
        setTalk(talk);
      }
    });

    engine
      .fetchCollectionItems("conferences")
      .then((conferences: z.infer<typeof conferenceSchema>[]) => {
        setConferences(
          conferences.filter((conference) =>
            conference.proposedTalks.find((_talk) => _talk.id === talkId)
          )
        );
      });
  }, [talkId]);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-row items-center justify-between gap-2">
            <h1 className="text-2xl font-bold">{talk?.title}</h1>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  <Ellipsis className="h-6 w-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <a href={`/talks/${talk?.id}`}>
                    <Info className="h-6 w-6" />
                    Details
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href={`/talks/${talk?.id}/edit`}>
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
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="md:w-1/2">
              <h2 className="text-lg font-bold mb-4">Description</h2>
              <p>{talk?.description}</p>
            </div>
            <div className="md:w-1/2">
              <h2 className="text-lg font-bold mb-4">Outline</h2>
              <pre>
                <p className="font-sans">{talk?.outline}</p>
              </pre>
            </div>
          </div>

          <div>
            <h2 className="flex flex-row items-center gap-2 mb-4">
              <span className="text-lg font-bold">Conferences</span>
              <Badge>{conferences.length}</Badge>
            </h2>
            {!Boolean(conferences.length) && (
              <p>This talk has not been proposed to any conferences, yet.</p>
            )}
            <ul>
              {conferences.map((conference) => (
                <li key={conference.id}>
                  <a href={`/conferences/${conference.id}`}>
                    {conference.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
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
                await engine.removeFromCollection("talks", talkId);
                setIsDeleteDialogOpen(false);
                router.push("/talks");
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
