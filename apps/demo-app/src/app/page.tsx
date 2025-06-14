"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Home() {
  return (
    <>
      <div className="text-center flex flex-col my-24">
        <h1 className="font-bold text-4xl">
          Track Your CFPs with Ease with CFPlease
        </h1>

        <p>
          They're your CFPs and you want 'em now. Never miss a CFP deadline
          again.'
        </p>

        <div>
          <Button className={"m-2 mt-16 bg-green-100!"}>Get Started</Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 w-full lg:px-24">
        <Card className={"lg:w-1/3! p-4 gap-4 flex flex-col"}>
          <h3 className="font-bold">Track Upcoming Conferences</h3>
          <p>
            It can be easy to forget the CFP dates and schedules for each
            conference. Keep track of them all in one place.
          </p>
        </Card>

        <Card className={"lg:w-1/3! p-4 gap-4 flex flex-col"}>
          <h3 className="font-bold">Track the Talks You Could Give</h3>
          <p>
            You have talks that could be used at a bunch of different
            conferences. Keep their titles and descriptions in one place. Reduce
            the repetition.
          </p>
        </Card>

        <Card className={"lg:w-1/3! p-4 gap-4 flex flex-col"}>
          <h3 className="font-bold">Track Which Talks You Proposed</h3>
          <p>
            You have talks you've proposed to conferences. Keep track of which
            talks you proposed and which talks you didn't.
          </p>
        </Card>
      </div>
    </>
  );
}
