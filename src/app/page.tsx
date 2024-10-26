"use client"

import { useState } from "react"
import { Button } from "~/components/ui/button"
import { ModeToggle } from "~/components/ui/mode-toggle"
import { Textarea } from "~/components/ui/textarea"

export default function Page() {
  const [inputText, setInputText] = useState("");
  return (
    <div className="w-screen h-screen flex flex-col gap-4 justify-center items-center px-4 md:px-12 lg:px-96">
      <div className="absolute left-0 top-0 m-4">
        <ModeToggle />
      </div>
      <div className="text-3xl font-thin">Hi, i&apos;m <span className="font-bold text-primary brightness-150">Amadeus</span>.</div>

      <Textarea placeholder="What should we revise?" value={inputText} onInput={
        // @ts-expect-error it works. chill
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        (e) => setInputText(e.target.value)
      } className="resize-y overflow-auto"></Textarea>

      <Button disabled={inputText.length == 0} className="hover:rotate-1 transition-all">Start Session</Button>
    </div>
  )
}