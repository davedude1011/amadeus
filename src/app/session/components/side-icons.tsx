import { ModeToggle } from "~/components/ui/mode-toggle";
import { GearIcon, PinLeftIcon } from "@radix-ui/react-icons";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import QuestionTypeSelectionElement from "./question-type-selection";

export default function SideIcons({ selected_question_types, toggle_selected_question_type }: { selected_question_types: Record<string, boolean>, toggle_selected_question_type: (question_type: string) => void }) {
    return (
        <div className="fixed left-0 top-0 m-4 flex flex-col gap-2">
            <Link href={"/"} className="w-full">
                <Button variant={"outline"} className="px-0 w-full">
                    <PinLeftIcon />
                </Button>
            </Link>

            <ModeToggle />

            <Dialog>
                <DialogTrigger className="w-full">
                    <Button variant={"outline"} className="px-0 w-full">
                        <GearIcon />
                    </Button>
                </DialogTrigger>

                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>What kind of questions do you want to see?</DialogTitle>
                        <DialogDescription>
                            <QuestionTypeSelectionElement {...{is_dialog:true, selected_question_types, toggle_selected_question_type}} />
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </div>
    )
}