// Package repository is a small thread-safe in-memory data store.
//
// It replaces a hosted database so the project runs with zero external
// services. Each Table keeps insertion order so list endpoints are stable.
package repository

import (
	"sync"

	models "apex-iot-backend/Models"
)

// Table is a generic in-memory table keyed by a string ID.
type Table[T any] struct {
	mu    sync.RWMutex
	items map[string]T
	order []string
}

func NewTable[T any]() *Table[T] {
	return &Table[T]{items: make(map[string]T)}
}

// Put inserts or replaces the item stored under id.
func (t *Table[T]) Put(id string, item T) {
	t.mu.Lock()
	defer t.mu.Unlock()
	if _, exists := t.items[id]; !exists {
		t.order = append(t.order, id)
	}
	t.items[id] = item
}

func (t *Table[T]) Get(id string) (T, bool) {
	t.mu.RLock()
	defer t.mu.RUnlock()
	item, ok := t.items[id]
	return item, ok
}

// Update applies fn to the item stored under id. It reports whether the item existed.
func (t *Table[T]) Update(id string, fn func(*T)) bool {
	t.mu.Lock()
	defer t.mu.Unlock()
	item, ok := t.items[id]
	if !ok {
		return false
	}
	fn(&item)
	t.items[id] = item
	return true
}

// Delete removes the item stored under id. It reports whether the item existed.
func (t *Table[T]) Delete(id string) bool {
	t.mu.Lock()
	defer t.mu.Unlock()
	if _, ok := t.items[id]; !ok {
		return false
	}
	delete(t.items, id)
	for i, existing := range t.order {
		if existing == id {
			t.order = append(t.order[:i], t.order[i+1:]...)
			break
		}
	}
	return true
}

// DeleteWhere removes every item matching match and returns how many were removed.
func (t *Table[T]) DeleteWhere(match func(T) bool) int {
	t.mu.Lock()
	defer t.mu.Unlock()
	kept := t.order[:0]
	removed := 0
	for _, id := range t.order {
		if match(t.items[id]) {
			delete(t.items, id)
			removed++
			continue
		}
		kept = append(kept, id)
	}
	t.order = kept
	return removed
}

// All returns every item in insertion order.
func (t *Table[T]) All() []T {
	return t.Filter(func(T) bool { return true })
}

// Filter returns the items matching keep, in insertion order.
func (t *Table[T]) Filter(keep func(T) bool) []T {
	t.mu.RLock()
	defer t.mu.RUnlock()
	out := make([]T, 0, len(t.order))
	for _, id := range t.order {
		if item := t.items[id]; keep(item) {
			out = append(out, item)
		}
	}
	return out
}

// Count returns the number of items matching keep.
func (t *Table[T]) Count(keep func(T) bool) int64 {
	return int64(len(t.Filter(keep)))
}

// The application's tables.
var (
	Organisations = NewTable[models.Organisation]()
	Users         = NewTable[models.User]()
	Groups        = NewTable[models.Group]()
	AccessRoles   = NewTable[models.AccessRole]()
	Devices       = NewTable[models.Device]()
	Records       = NewTable[models.DeviceRecord]()
	Notifications = NewTable[models.DeviceNotification]()
)
