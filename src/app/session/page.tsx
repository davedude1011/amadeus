"use client"

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import QuestionTypeSelectionElement from "./components/question-type-selection";
import SideIcons from "./components/side-icons";
import { generate_question_data } from "~/server/generation";
import QuestionElement from "./components/question";

export default function Page() {
    const [selected_question_types, set_selected_question_types] = useState<Record<string, boolean>>({
        "flashcards": true,
        "textual questions": true,
        "multiple-choice questions": true
    })
    function toggle_selected_question_type(question_type: string) {
        set_selected_question_types({...selected_question_types, [question_type]:!selected_question_types[question_type] })
    }

    const [question_generating, set_question_generating] = useState(false)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [question_data, set_question_data] = useState<{question_type: string, question_data: any}[]>([]);
    function generate_question(id: string) {
        set_question_generating(true)

        function get_random_key(obj: Record<string, boolean>) {
            const trueKeys = Object.keys(obj).filter(key => obj[key]);
            return trueKeys[Math.floor(Math.random() * trueKeys.length)] ?? "";
        }
        
        const random_question_type = get_random_key(selected_question_types);

        generate_question_data(id, random_question_type, question_data.map(({ question_type, question_data }) => 
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
            question_type === "flashcards" ? question_data.front : question_data.question
        ))
            .then((generated_question_data) => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                set_question_data([...question_data, {question_type: random_question_type, question_data: generated_question_data}])
                set_question_generating(false)
            })
            .catch((error) => {
                console.error(error);
                set_question_generating(false)
            });
    }

    const [id, set_id] = useState("")
    useEffect(() => {
        const url = window.location.href;
        const urlObj = new URL(url);
        const params = new URLSearchParams(urlObj.search);
        set_id(params.get('id')??"")
    }, [])

    if (!id || id === undefined || id.length > 20 || id.length < 20) {
        return (
            <div className="flex flex-col w-screen h-screen justify-center items-center gap-4">
                <div>
                    The Session was either not found or incorrect :(
                </div>
                <div>
                    <Link href={"/"}>
                        <Button>Create a new session</Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="w-screen h-screen flex flex-col gap-4  items-center py-12 relative overflow-auto px-4 md:px-12 lg:px-96">
            <SideIcons {...{selected_question_types, toggle_selected_question_type}} />

            <QuestionTypeSelectionElement {...{selected_question_types, toggle_selected_question_type}} />

            {
                question_data.map((data, index) => (
                    <QuestionElement key={index} {...{data}} />
                ))
            }

            <Button className={`hover:rotate-1 transition-all ${question_generating&&"animate-pulse"}`} disabled={question_generating} onClick={() => generate_question(id)}>Generate Question</Button>
        </div>
    )
}