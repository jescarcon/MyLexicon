

export class EntryResponseDto {
    id: number;
    wordFrom: string;
    languageFrom: string;
    wordTo: string;
    languageTo: string;
    category: string;
    notes?: string;
    isFavorite: boolean;
    dictionaryId: number;
    createdAt: Date;
    updatedAt: Date;
}

