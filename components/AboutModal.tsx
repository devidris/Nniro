'use client'
import { useRouter } from 'next/navigation'
import React from 'react'
import Modal from './Modal'

type Props = {}

const AboutModal = (props: Props) => {

    const router = useRouter()


    const onClose = React.useCallback(() => {
        router.push('/')
    }, [router])


    return (
        <Modal
            title='About Modal'
            onClose={onClose}
            isOpen={true}
        >
            <div className='p-4 max-h-[450px] overflow-y-auto'>
                {/* <video width="320" height="240" controls>
                    <source src='/about.mov' type='video/mov'/>
                </video> */}
                <p>123321</p>
            </div>

        </Modal>
    )
}

export default AboutModal