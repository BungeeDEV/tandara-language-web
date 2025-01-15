import Image from 'next/image'

export function Logo() {
    return (
        <div className="flex items-center space-x-2">
            <Image src="/logo.png" alt="Language System Logo" width={256} height={256} />
        </div>
    )
}