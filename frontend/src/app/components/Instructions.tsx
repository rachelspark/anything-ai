import instructions from "../utils/instructions.json"

export default function Instructions(props: { index: any }) {
    var instruction = instructions[props.index]

    return (
        <div className="mb-4">
            <div className="text-black font-bold py-2">
                {`Step ${instruction.id} of ${instructions.length}`}
            </div>
            <div>
                {instruction.description}
            </div>
        </div>
    )
}