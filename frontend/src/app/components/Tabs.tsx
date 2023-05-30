import { Fragment } from 'react'
import { Tab } from '@headlessui/react'

export default function Tabs(props: { setMaskState: any } ) {
  return (
    <div className="w-full py-2">
        <Tab.Group
            onChange={(index) => {
                const maskStates = ["replace", "fill"];
                props.setMaskState(maskStates[index])
                console.log('Changed selected tab to:', maskStates[index])
            }}
        >
        <Tab.List className="flex space-x-1 rounded bg-indigo-800/20 p-1">
            <Tab as={Fragment}>
            {({ selected }) => (
                <button
                className={
                    "w-full rounded py-1.5 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none" +
                    (selected ? ' bg-white shadow text-indigo-800' : 'text-blue-100 hover:bg-white/[0.20] hover:text-black')
                }
                >
                Replace
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
                Fill
                </button>
            )}
            </Tab>
        </Tab.List>
        <Tab.Panels className="mt-1.5">
            <Tab.Panel className="rounded text-sm bg-indigo-800/20 p-3">Keep the selected object and replace the background.</Tab.Panel>
            <Tab.Panel className="rounded text-sm bg-indigo-800/20 p-3">Keep the background and fill the hole of the selected object.</Tab.Panel>
        </Tab.Panels>
        </Tab.Group>
    </div>
  )
}