'use client';

import type { StudioDocumentV1 } from '~/studio/_lib/types';

const DB_NAME = 'invitara-studio';
const STORE_NAME = 'documents';
const DOCUMENT_KEY = 'default';

export async function loadStudioDocument(): Promise<StudioDocumentV1 | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const request = tx.objectStore(STORE_NAME).get(DOCUMENT_KEY);
    request.onsuccess = () => resolve((request.result as StudioDocumentV1 | undefined) ?? null);
    request.onerror = () => reject(request.error);
  });
}

export async function saveStudioDocument(document: StudioDocumentV1) {
  const db = await openDb();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const request = tx.objectStore(STORE_NAME).put(document, DOCUMENT_KEY);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function clearStudioDocument() {
  const db = await openDb();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const request = tx.objectStore(STORE_NAME).delete(DOCUMENT_KEY);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
