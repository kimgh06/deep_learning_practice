import cv2

cap = cv2.VideoCapture(0)  # 0 for default camera, change if necessary

while True:
    ret, frame = cap.read()
    if not ret:
        break

    # Perform sign language recognition and translation here
    sign_language_to_text = {
        'A': 'Apple',
        'B': 'Banana',
        # Add more mappings as needed
    }

    recognized_sign = 'A'  # Replace with the recognized sign
    if recognized_sign in sign_language_to_text:
        translation = sign_language_to_text[recognized_sign]
    else:
        translation = 'Translation not found'

    print(f'Sign: {recognized_sign}, Translation: {translation}')


    cv2.imshow('Sign Language Translator', frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()