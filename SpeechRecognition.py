import speech_recognition as sr
sr.__version__
r = sr.Recognizer()
with sr.Microphone() as source:
    print("Start to say")
    speech = r.listen(source)

try:
    audio = r.recognize_google(speech, language="en-US")
    print("your audio: " + audio)
except sr.UnknownValueError:
    print("Can't understanding")
except sr.RequestError as e:
    print("Request Error!; {0}".format(e))
