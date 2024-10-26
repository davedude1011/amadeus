"use client"

import { Session } from "inspector/promises"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Button } from "~/components/ui/button"
import { ModeToggle } from "~/components/ui/mode-toggle"
import { Textarea } from "~/components/ui/textarea"
import { create_session, get_recent_sessions } from "~/server/generation"

export default function Page() {
  const [inputText, setInputText] = useState("");

  const [recent_sessions, set_recent_sessions] = useState<{session_id: string, session_title: string}[]>([])
  useEffect(() => {
    get_recent_sessions()
      .then((sessions) => {
        set_recent_sessions(sessions)
      })
      .catch((error) => {
        console.error(error);
      });
  }, [])
  
  return (
    <div className="w-screen flex flex-col overflow-auto">
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

        <Button disabled={inputText.length == 0} className="hover:rotate-1 transition-all" onClick={() => {
          create_session(inputText)
            .then((session_id) => {
              window.open(window.location.href + "/session?id=" + session_id, "_self")
            })
            .catch((error) => {
              console.error(error);
            });
        }}>Start Session</Button>
      </div>
      <div className="w-screen h-screen flex flex-wrap gap-4 p-4">
        {
          recent_sessions.map((session, index) => (
            <div key={index} className="flex flex-col gap-2 border border-primary rounded-md p-4 flex-grow">
              <div>
                {session.session_title}
              </div>
              <Link href={window.location.href + "/session?id=" + session.session_id} className="w-fit h-fit">
                <Button>Open Session</Button>
              </Link>
            </div>
          ))
        }
      </div>
    </div>
  )
}