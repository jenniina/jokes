import { useCallback, useMemo, useState } from 'react'

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

  const storageKeys = useMemo(() => {
    return statuses?.map((status) => `DnD-${status}`)
  }, [statuses])

  const stateKey = useMemo(() => {
    return JSON.stringify({
      statuses,
      initialState: initialState.map((item) => ({
        id: item.id,
        status: item.status,
      })),
    })
  }, [initialState, statuses])

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

  const createItemsByStatus = useCallback(() => {
    return statuses.reduce(
      (acc, status, index) => {
        const storedItems = getStoredItems(storageKeys[index])
        acc[status] =
          storedItems.length > 0
            ? storedItems
            : initialState.filter((item) => item.status === status)
        return acc
      },
      {} as Record<S, T[]>
    )
  }, [getStoredItems, initialState, statuses, storageKeys])

  const [listState, setListState] = useState(() => ({
    key: stateKey,
    itemsByStatus: createItemsByStatus(),
  }))

  const itemsByStatus =
    listState.key === stateKey ? listState.itemsByStatus : createItemsByStatus()

  const updateItemsByStatus = useCallback(
    (updater: (currentItemsByStatus: Record<S, T[]>) => Record<S, T[]>) => {
      setListState((prev) => {
        const currentItemsByStatus =
          prev.key === stateKey ? prev.itemsByStatus : createItemsByStatus()

        return {
          key: stateKey,
          itemsByStatus: updater(currentItemsByStatus),
        }
      })
    },
    [createItemsByStatus, stateKey]
  )

  const listItemsByStatus = useMemo(() => {
    return statuses.reduce(
      (acc, status, index) => {
        acc[status] = {
          items: itemsByStatus[status] ?? [],
          setItems: (items: T[]) => {
            setStoredItems(storageKeys[index], items)
            updateItemsByStatus((currentItemsByStatus) => ({
              ...currentItemsByStatus,
              [status]: items,
            }))
          },
          removeItems: () => {
            removeStoredItems(storageKeys[index])
            updateItemsByStatus((currentItemsByStatus) => ({
              ...currentItemsByStatus,
              [status]: [],
            }))
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
    itemsByStatus,
    removeStoredItems,
    setStoredItems,
    statuses,
    storageKeys,
    updateItemsByStatus,
  ])

  const handleUpdate = useCallback(
    (id: number, newStatus: S, target?: number) => {
      const oldStatus = Object.keys(listItemsByStatus)?.find((status) =>
        listItemsByStatus?.[status as S]?.items?.find((item) => item?.id === id)
      ) as S

      if (!oldStatus) return

      const card = listItemsByStatus?.[oldStatus]?.items?.find(
        (item) => item?.id === id
      )
      const targetIndex = listItemsByStatus?.[newStatus]?.items?.findIndex(
        (item) => item?.id === target
      )

      if (!card) return

      const updatedCard = {
        ...card,
        status: newStatus,
      }

      const oldStatusItems = listItemsByStatus?.[oldStatus]?.items?.filter(
        (item: T) => item.id !== id
      )
      let newStatusItems = [...listItemsByStatus?.[newStatus]?.items]
      newStatusItems = newStatusItems.filter(
        (item) => item.id !== updatedCard.id
      )
      newStatusItems.splice(
        targetIndex >= 0 ? targetIndex : newStatusItems.length,
        0,
        updatedCard
      )

      setStoredItems(storageKeys[statuses.indexOf(oldStatus)], oldStatusItems)
      setStoredItems(storageKeys[statuses.indexOf(newStatus)], newStatusItems)

      updateItemsByStatus((currentItemsByStatus) => ({
        ...currentItemsByStatus,
        [oldStatus]: oldStatusItems,
        [newStatus]: newStatusItems,
      }))

      return newStatusItems
    },
    [
      listItemsByStatus,
      setStoredItems,
      statuses,
      storageKeys,
      updateItemsByStatus,
    ]
  )

  const handleRenameStatus = useCallback(
    (oldStatus: S, newStatus: S) => {
      if (oldStatus === newStatus) return

      const oldStatusIndex = statuses?.indexOf(oldStatus)

      if (oldStatusIndex === -1) {
        console.error(`Old status "${oldStatus}" not found in statuses array`)
        return
      }

      const oldStorageKey = storageKeys[oldStatusIndex]
      const newStorageKey = `DnD-${newStatus}`

      const updatedItems = listItemsByStatus[oldStatus].items.map((item) => ({
        ...item,
        status: newStatus,
      }))

      updateItemsByStatus((currentItemsByStatus) => ({
        ...currentItemsByStatus,
        [oldStatus]: [],
        [newStatus]: updatedItems,
      }))

      setStoredItems(newStorageKey, updatedItems)
      removeStoredItems(oldStorageKey)
    },
    [
      listItemsByStatus,
      storageKeys,
      statuses,
      setStoredItems,
      removeStoredItems,
      updateItemsByStatus,
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
