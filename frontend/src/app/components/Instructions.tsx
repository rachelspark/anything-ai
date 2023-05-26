import instructions from "../utils/instructions.json"

export default function Instructions({ index }) {
    var instruction = instructions[index]

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