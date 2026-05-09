import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export interface IClosestItem {
  offset: number
  element?: HTMLElement
}

interface Item {
  id: number
  status: string
}

export const useDragAndDrop = <T extends Item, S extends string>(
  initialState: T[],
  statuses: S[]
) => {
  const [isDragging, setIsDragging] = useState(false)
  const [updatedItems, setUpdatedItems] = useState(initialState)

  useEffect(() => {
    setUpdatedItems(initialState)
  }, [initialState])

  const storageKeys = useMemo(() => {
    return statuses?.map(status => `DnD-${status}`)
  }, [statuses])

  const getStoredItems = useCallback((key: string): T[] => {
    if (typeof window === 'undefined') return []
    try {
      const storedItems = localStorage.getItem(key)
      return storedItems ? (JSON.parse(storedItems) as T[]) : []
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return []
    }
  }, [])

  const setStoredItems = useCallback((key: string, items: T[]) => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(key, JSON.stringify(items))
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }, [])

  const removeStoredItems = useCallback((key: string) => {
    if (typeof window === 'undefined') return
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error)
    }
  }, [])

  const initializeListItemsByStatus = useCallback(() => {
    return statuses?.reduce(
      (acc, status, index) => {
        const storedItems = getStoredItems(storageKeys[index])
        acc[status] = {
          items:
            storedItems.length > 0
              ? storedItems
              : initialState.filter(item => item.status === status),
          setItems: (items: T[]) => {
            setStoredItems(storageKeys[index], items)
            // setListItemsByStatus(prev => ({
            //   ...prev,
            //   [status]: {
            //     ...prev[status],
            //     items,
            //   },
            // }))
          },
          removeItems: () => {
            removeStoredItems(storageKeys[index])
            // setListItemsByStatus(prev => ({
            //   ...prev,
            //   [status]: {
            //     ...prev[status],
            //     items: [],
            //   },
            // }))
          },
        }
        return acc
      },
      {} as Record<
        S,
        { items: T[]; setItems: (value: T[]) => void; removeItems: () => void }
      >
    )
  }, [
    statuses,
    storageKeys,
    initialState,
    getStoredItems,
    setStoredItems,
    removeStoredItems,
  ])

  const deepEqual = useCallback((a: T[] | S[], b: T[] | S[]) => {
    return JSON.stringify(a) === JSON.stringify(b)
  }, [])

  const [listItemsByStatus, setListItemsByStatus] = useState(
    initializeListItemsByStatus
  )

  const prevUpdatedItemsRef = useRef(updatedItems)
  const prevStatusesRef = useRef(statuses)

  const handleUpdating = useCallback(() => {
    const prevUpdatedItems = prevUpdatedItemsRef.current
    const prevStatuses = prevStatusesRef.current

    // Compare previous and current values
    if (
      !deepEqual(prevUpdatedItems, updatedItems) ||
      !deepEqual(prevStatuses, statuses)
    ) {
      const newListItemsByStatus = statuses?.reduce(
        (acc, status, index) => {
          const items = updatedItems.filter(item => item.status === status)
          acc[status] = {
            items,
            setItems:
              listItemsByStatus[status]?.setItems ||
              ((items: T[]) => {
                setStoredItems(storageKeys[index], items)
                setListItemsByStatus(prev => ({
                  ...prev,
                  [status]: {
                    ...prev[status],
                    items,
                  },
                }))
              }),
            removeItems:
              listItemsByStatus[status]?.removeItems ||
              (() => {
                removeStoredItems(storageKeys[index])
                setListItemsByStatus(prev => ({
                  ...prev,
                  [status]: {
                    ...prev[status],
                    items: [],
                  },
                }))
              }),
          }
          return acc
        },
        {} as Record<
          S,
          {
            items: T[]
            setItems: (value: T[]) => void
            removeItems: () => void
          }
        >
      )

      setListItemsByStatus(newListItemsByStatus)

      // Update refs with current values
      prevUpdatedItemsRef.current = updatedItems
      prevStatusesRef.current = statuses
    }
  }, [
    updatedItems,
    statuses,
    storageKeys,
    setStoredItems,
    removeStoredItems,
    listItemsByStatus,
    deepEqual,
  ])

  useEffect(() => {
    handleUpdating()
  }, [
    updatedItems,
    statuses,
    storageKeys,
    setStoredItems,
    removeStoredItems,
    handleUpdating,
  ])

  const handleStoredItems = useCallback(() => {
    statuses?.forEach((status, index) => {
      const items = updatedItems?.filter(item => item.status === status)
      setStoredItems(storageKeys[index], items)
    })
  }, [updatedItems, statuses, storageKeys, setStoredItems])

  useEffect(() => {
    handleStoredItems()
  }, [updatedItems, statuses, storageKeys, handleStoredItems])

  const handleUpdate = useCallback(
    (id: number, newStatus: S, target?: number) => {
      const oldStatus = Object.keys(listItemsByStatus)?.find(status =>
        listItemsByStatus?.[status as S]?.items?.find(item => item?.id === id)
      ) as S

      if (!oldStatus) return

      const card = listItemsByStatus?.[oldStatus]?.items?.find(
        item => item?.id === id
      )
      const targetIndex = listItemsByStatus?.[newStatus]?.items?.findIndex(
        item => item?.id === target
      )

      if (!card) return

      // Update card status
      card.status = newStatus

      // Remove card from old status list
      const oldStatusItems = listItemsByStatus?.[oldStatus]?.items?.filter(
        (item: T) => item.id !== id
      )
      listItemsByStatus?.[oldStatus]?.setItems(oldStatusItems)

      // Create a copy of the new status list
      let newStatusItems = [...listItemsByStatus?.[newStatus]?.items]

      // Remove the card from its old position in the new status list
      newStatusItems = newStatusItems.filter(item => item.id !== card.id)

      // Insert the card at the correct position in the new status list
      newStatusItems.splice(
        targetIndex >= 0 ? targetIndex : newStatusItems.length,
        0,
        card
      )

      // Update the new status list
      listItemsByStatus?.[newStatus]?.setItems(newStatusItems)

      // Update the listItemsByStatus state
      setListItemsByStatus(prev => ({
        ...prev,
        [oldStatus]: {
          ...prev[oldStatus],
          items: oldStatusItems,
        },
        [newStatus]: {
          ...prev[newStatus],
          items: newStatusItems,
        },
      }))

      return newStatusItems
    },
    [listItemsByStatus, setListItemsByStatus]
  )

  const handleRenameStatus = useCallback(
    (oldStatus: S, newStatus: S) => {
      if (oldStatus === newStatus) return

      const oldStatusIndex = statuses?.indexOf(oldStatus)

      if (oldStatusIndex === -1) {
        console.error(`Old status "${oldStatus}" not found in statuses array`)
        return
      }

      // Get the old and new storage keys
      const oldStorageKey = storageKeys[oldStatusIndex]
      const newStorageKey = `DnD-${newStatus}`

      // Update items' status
      const updatedItems = listItemsByStatus[oldStatus].items.map(item => ({
        ...item,
        status: newStatus,
      }))

      // Update state
      setListItemsByStatus(prev => ({
        ...prev,
        [oldStatus]: {
          ...prev[oldStatus],
          items: [],
        },
        [newStatus]: {
          ...prev[newStatus],
          items: updatedItems,
        },
      }))

      // Update local storage using safe functions
      setStoredItems(newStorageKey, updatedItems)
      removeStoredItems(oldStorageKey)
    },
    [
      listItemsByStatus,
      storageKeys,
      statuses,
      setStoredItems,
      removeStoredItems,
    ]
  )

  const handleDragging = (dragging: boolean) => setIsDragging(dragging)

  return {
    isDragging,
    listItemsByStatus,
    handleUpdate,
    handleRenameStatus,
    handleDragging,
  }
}
