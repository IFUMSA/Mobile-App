"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { api, Quiz } from "@/lib/api";

export default function QuizzesPage() {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchQuizzes();
    }, []);

    const fetchQuizzes = async () => {
        try {
            const data = await api.getQuizzes();
            setQuizzes(data.quizzes || []);
        } catch (error) {
            console.error("Failed to fetch quizzes:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString("en-NG", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Quizzes</h1>
                <p className="text-zinc-500">View and moderate shared quizzes</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Shared Quizzes ({quizzes.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p className="text-center py-8 text-zinc-500">Loading...</p>
                    ) : quizzes.length === 0 ? (
                        <p className="text-center py-8 text-zinc-500">
                            No shared quizzes to moderate. User-shared quizzes will appear here.
                        </p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Created By</TableHead>
                                    <TableHead>Questions</TableHead>
                                    <TableHead>Shared</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {quizzes.map((quiz) => (
                                    <TableRow key={quiz._id}>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{quiz.title}</p>
                                                {quiz.description && (
                                                    <p className="text-sm text-zinc-500 line-clamp-1">
                                                        {quiz.description}
                                                    </p>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">
                                                    {quiz.createdBy?.firstName} {quiz.createdBy?.lastName}
                                                </p>
                                                <p className="text-sm text-zinc-500">
                                                    {quiz.createdBy?.email}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">
                                                {quiz.questions?.length || 0} questions
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {quiz.sharedAt ? formatDate(quiz.sharedAt) : formatDate(quiz.createdAt)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
