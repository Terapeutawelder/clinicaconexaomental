from youtube_transcript_api import YouTubeTranscriptApi
try:
    transcript = YouTubeTranscriptApi.get_transcript('SEqNqKoxSIg', languages=['pt', 'en', 'pt-BR'])
    text = ' '.join([t['text'] for t in transcript])
    with open('transcript.txt', 'w', encoding='utf-8') as f:
        f.write(text)
    print('Transcript saved successfully.')
except Exception as e:
    print(f'Error: {e}')
