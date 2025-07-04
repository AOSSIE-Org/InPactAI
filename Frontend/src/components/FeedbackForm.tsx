import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Send, MessageSquare, Lightbulb, Bug, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner'
import axios from 'axios';


const FeedbackForm = () => {

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        type: '',
        message: '',
        role: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const feedbackTypes = [
        { value: 'feedback', label: 'General Feedback', icon: MessageSquare, color: 'text-blue-500' },
        { value: 'suggestion', label: 'Feature Suggestion', icon: Lightbulb, color: 'text-yellow-500' },
        { value: 'bug', label: 'Bug Report', icon: Bug, color: 'text-red-500' },
        { value: 'praise', label: 'Praise & Thanks', icon: Star, color: 'text-green-500' }
    ];

    const rolesTypes = [
        { value: "creater", label: "Content Creator" },
        { value: "brand/agency", label: "Brand/Agency" },
    ]


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const res = await axios.post(`https://formspree.io/f/${import.meta.env.VITE_FROMSPEE_ID}`, {
                name: formData.name,
                email: formData.email,
                type: formData.type,
                message: formData.message,
                role : formData.role
            })

            if (res.status === 200) {
                toast.success('Message sent successfully')
                setFormData({
                    name: '',
                    email: '',
                    type: '',
                    message: '',
                    role: ''
                })
            }
        } catch (error) {
            toast.error('Error sending message')

        } finally {
            setIsSubmitting(false);
        }
    }
    return (
        <div className="space-y-8 mb-10">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
            >
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                    Share <span className='text-purple-600'>Your</span> Thoughts
                </h2>
                <p className="text-lg text-gray-600">
                    Your feedback helps us improve and build better features for everyone
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="max-w-2xl mx-auto"
            >
                <Card className="border-2 border-purple-100 shadow-xl">
                    <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-t-lg">
                        <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
                            <MessageSquare className="h-6 w-6 text-purple-600" />
                            Send us a message
                        </CardTitle>
                        <CardDescription className="text-center">
                            Messages are sent directly to our team for quick response
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="Your name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="your@email.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="type">Message Type</Label>
                                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select message type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {feedbackTypes.map((type) => (
                                            <SelectItem key={type.value} value={type.value}>
                                                <div className="flex items-center gap-2">
                                                    <type.icon className={`h-4 w-4 ${type.color}`} />
                                                    {type.label}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="role">I am</Label>
                                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select message type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {rolesTypes.map((type) => (
                                            <SelectItem key={type.value} value={type.value}>
                                                <div className="flex items-center gap-2">
                                                    {type.label}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="message">Message</Label>
                                <Textarea
                                    id="message"
                                    placeholder="Tell us what's on your mind..."
                                    rows={10}
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    required
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                            >
                                {isSubmitting ? 'Sending...' : 'Send Message'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};

export default FeedbackForm;