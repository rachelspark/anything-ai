import { Fragment } from 'react'
import { Tab } from '@headlessui/react'

export default function Tabs(props: { setMaskState: any } ) {
  return (
    <div className="w-full py-2">
        <Tab.Group
            onChange={(index) => {
                const maskStates = ["replace", "fill"];
                props.setMaskState(maskStates[index])
            }}
        >
        <Tab.List className="flex space-x-1 text-xs rounded bg-indigo-800/20 p-1">
            <Tab as={Fragment}>
            {({ selected }) => (
                <button
                className={
                    "w-full rounded py-1.5 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none" +
                    (selected ? ' bg-white shadow text-indigo-800' : 'text-blue-100 hover:bg-white/[0.20] hover:text-black')
                }
                >
                Background
                </button>
            )}
            </Tab>
            <Tab as={Fragment}>
            {({ selected }) => (
                <button
                className={
                    "w-full rounded py-1.5 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none" +
                    (selected ? ' bg-white shadow text-indigo-800' : 'text-blue-100 hover:bg-white/[0.20] hover:text-black')
                }
                >
                Object
                </button>
            )}
            </Tab>
        </Tab.List>
        <Tab.Panels className="text-xs mt-1.5">
            <Tab.Panel className="rounded text-sm bg-indigo-800/20 p-3">Generate new background (everything around this object).</Tab.Panel>
            <Tab.Panel className="rounded text-sm bg-indigo-800/20 p-3">Generate object.</Tab.Panel>
        </Tab.Panels>
        </Tab.Group>
    </div>
  )
}