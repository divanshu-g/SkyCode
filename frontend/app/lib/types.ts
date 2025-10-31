export interface Project {
    id: string;
    name: string;
    status: 'queued' | 'building' | 'completed' | 'failed';
    url: string;
    createdAt: string; 
}