import { cn } from "@/lib/utils"
import { ReactNode, useState } from "react"

type SmallStatButtonProps = {
    onPress: VoidFunction
    children: ReactNode
    className?: string
    canBePressed?: boolean
    theme?: null | 'default' | 'green'
    skipRightBorder?: boolean
    skipBottomBorder?: boolean
    shouldExpand?: boolean
    disableHaptics?: boolean
    borderRadius?: number
}

export default function SmallStatButton(props: SmallStatButtonProps) {
    const { onPress, className, theme, children, skipRightBorder, shouldExpand, borderRadius } = props
    const [isPressed, setIsPressed] = useState(false)

    const colorScheme = theme ?? "default"

    const handleClick = () => {
        onPress()
    }

    const handleMouseDown = () => {
        setIsPressed(true)
    }

    const handleMouseUp = () => {
        setIsPressed(false)
    }

    return (
        <>
            {colorScheme === "default" && (
                <button
                    onClick={handleClick}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    className={cn(
                        "p-2 bg-white dark:bg-primary-black border-2 border-gray-300 dark:border-[#37464f]",
                        "transition-all duration-150 ease-in-out",
                        isPressed ? "translate-y-[3px] shadow-none" : "[box-shadow:0_3px_0_0_rgb(209_213_219)] dark:[box-shadow:0_3px_0_0_#37464f]",
                        skipRightBorder ? "border-r-0 rounded-r-none" : "",
                        shouldExpand ? "flex-1" : "",
                        className
                    )}
                    style={{
                        borderRadius: borderRadius ?? 12
                    }}
                >
                    {children}
                </button>
            )}
            {colorScheme === "green" && (
                <button
                    onClick={handleClick}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    className={cn(
                        "p-2 bg-green-500 text-white border-2 border-green-600",
                        "transition-all duration-150 ease-in-out",
                        isPressed ? "translate-y-[3px] shadow-none" : "[box-shadow:0_3px_0_0_rgb(22_163_74)]",
                        skipRightBorder ? "border-r-0 rounded-r-none" : "",
                        shouldExpand ? "flex-1" : "",
                        className
                    )}
                    style={{
                        borderRadius: borderRadius ?? 12
                    }}
                >
                    {children}
                </button>
            )}
        </>
    )
}
