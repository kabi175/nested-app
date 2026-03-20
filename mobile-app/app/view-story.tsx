import VideoStoryPlayer from '@/components/v2/VideoStoryPlayer';
import { router } from 'expo-router';
import React, { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';

const STORY_VIDEOS = [
    'https://res.cloudinary.com/dn6qn2gp8/video/upload/v1773954351/WhatsApp_Video_2026-03-17_at_9.01.57_PM_cf42q1.mp4',
    'https://res.cloudinary.com/dn6qn2gp8/video/upload/v1773954351/WhatsApp_Video_2026-03-17_at_9.01.57_PM_cf42q1.mp4',
];

export default function ViewStoryScreen() {
    const handleDone = useCallback(() => {
        router.replace('/child/create');
    }, []);

    return (
        <View style={styles.container}>
            <VideoStoryPlayer
                videos={STORY_VIDEOS}
                onComplete={handleDone}
                onSkip={handleDone}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
