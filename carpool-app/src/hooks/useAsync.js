import { useState, useCallback } from 'react'

/**
 * A hook to manage async operations with loading and error states
 * @template T The type of data returned by the async operation
 * @param {() => Promise<T>} asyncFn The async function to execute
 * @returns {[() => Promise<T>, boolean, Error | null]} Tuple of [execute, isLoading, error]
 */
export function useAsync(asyncFn) {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)

    const execute = useCallback(async (...args) => {
        try {
            setIsLoading(true)
            setError(null)
            const result = await asyncFn(...args)
            return result
        } catch (err) {
            setError(err)
            throw err
        } finally {
            setIsLoading(false)
        }
    }, [asyncFn])

    return [execute, isLoading, error]
}