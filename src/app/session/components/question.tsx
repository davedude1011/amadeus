import { AwaitedReactNode, JSXElementConstructor, Key, ReactElement, ReactNode, useState } from "react"
import { Button } from "~/components/ui/button";
import { Switch } from "~/components/ui/switch";
import { Textarea } from "~/components/ui/textarea";
import { check_answer, explain_question } from "~/server/generation";

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function QuestionElement({data}: {data: {question_type: string, question_data: any}}) {
    const [loading_async, set_loading_async] = useState(false);

    const [flashcard_toggle, set_flashcard_toggle] = useState(false);

    if (data.question_type == "flashcards") {
        return (
            <div onClick={() => set_flashcard_toggle(!flashcard_toggle)} className="p-12 border border-primary rounded-md w-full relative cursor-pointer transition-all brightness-75 hover:brightness-100">
                <div className="text-sm font-thin absolute top-0 left-0 m-2">
                    {flashcard_toggle?"answer":"question"}
                </div>
                {
                    flashcard_toggle ? (
                        <div>
                            {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */}
                            {data.question_data.back}
                        </div>
                    ) : (
                        <div>
                            {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */}
                            {data.question_data.front}
                        </div>
                    )
                }
            </div>
        )
    }

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [response, set_response] = useState("")
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [user_answer, set_user_answer] = useState("")

    if (data.question_type == "textual questions") {
        return (
            <div className="p-12 border border-primary rounded-md w-full flex flex-col gap-4">
                <div>
                    {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */}
                    {data.question_data.question}
                </div>
                <Textarea disabled={response.length > 0} placeholder="..." value={user_answer} onInput={
                    // @ts-expect-error it works. chill
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                    (e) => set_user_answer(e.target.value)
                } />
                {
                    response.length > 0 && (
                        <div className="border border-primary rounded-md p-4 md:pd-6 font-thin text-sm">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {response}
                            </ReactMarkdown>
                        </div>
                    )
                }
                {
                    response.length == 0 && (
                        <div className="flex flex-row gap-4">
                            <Button onClick={() => {
                                set_loading_async(true)
                                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
                                check_answer(data.question_data.question, user_answer)
                                    .then((generated_response) => {
                                        set_response(generated_response)
                                    })
                                    .catch((error) => {
                                        console.error(error);
                                    });
                            }} disabled={loading_async}>Check</Button>
                            <Button onClick={() => {
                                set_loading_async(true)
                                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
                                explain_question(data.question_data.question)
                                    .then((generated_response) => {
                                        set_response(generated_response)
                                    })
                                    .catch((error) => {
                                        console.error(error);
                                    });
                            }} disabled={loading_async}>Explain</Button>
                        </div>
                    )
                }
            </div>
        )
    }

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [selected_answers, set_selected_answers] = useState<string[]>([])

    if (data.question_type == "multiple-choice questions") {
        return (
            <div className="p-12 border border-primary rounded-md w-full flex flex-col gap-4">
                <div>
                    {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */}
                    {data.question_data.question}
                </div>
                <div className="flex flex-col gap-2">
                    {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any */}
                    {data.question_data.options.map((option: string) => (
                        <div key={option} className="flex flex-row gap-2 justify-start items-center" onClick={() => {
                            const new_selected_answers = selected_answers.includes(option)
                               ? selected_answers.filter((answer) => answer!= option)
                                : [...selected_answers, option]
                            set_selected_answers(new_selected_answers)
                        }}>
                            <Switch disabled={response.length > 0} checked={selected_answers.includes(option)} />
                            <label className="cursor-pointer">{option}</label>
                        </div>
                    ))}
                </div>
                {
                    response == "Correct!" ? (
                        <div className="text-lg">Correct!</div>
                    ) : response == "Incorrect!" ? (
                        <div className="flex flex-col">
                            <div className="text-lg">Incorrect!</div>
                            <div className="flex flex-col gap-2">
                                {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any */}
                                {data.question_data.answers.map((answers: string) => (
                                    <div key={answers} className="flex flex-row gap-2 justify-start items-center">
                                        <Switch disabled checked />
                                        <label>{answers}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : null
                }
                {
                    response.length == 0 && (
                        <div>
                            <Button onClick={() => {
                                let correct = true;
                                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                                if (selected_answers.length != data.question_data.answers.length) {
                                    correct = false;
                                }
                                else {
                                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                                    for (const answer of data.question_data.answers) {
                                        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                                        if (!selected_answers.includes(answer)) {
                                            correct = false;
                                            break;
                                        }
                                    }
                                }
            
                                if (correct) {
                                    set_response("Correct!")
                                }
                                else {
                                    set_response("Incorrect!")
                                }
                            }}>Check</Button>
                        </div>
                    )
                }
            </div>
        )
    }
}