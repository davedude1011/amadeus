import { Switch } from "~/components/ui/switch";

export default function QuestionTypeSelectionElement({ is_dialog=false, selected_question_types, toggle_selected_question_type }: { is_dialog?: boolean, selected_question_types: Record<string, boolean>, toggle_selected_question_type: (question_type: string) => void }) {
    return (
        <div className={`p-4 gap-6 flex flex-col items-start justify-center ${!is_dialog && "p-12 border border-primary rounded-md items-center"} w-full`}>
            {
                !is_dialog && <div>What kind of questions do you want to see?</div>
            }
            <div className="flex flex-col gap-2">
                {
                    Object.keys(selected_question_types).map((question_type) => (
                        <div key={question_type} className="flex flex-row gap-4 justify-start items-center">
                            <Switch checked={selected_question_types[question_type]} onCheckedChange={() => toggle_selected_question_type(question_type)}/>
                            <div onClick={() => toggle_selected_question_type(question_type)} className={is_dialog?"font-bold cursor-pointer":"cursor-pointer"}>{question_type}</div>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}