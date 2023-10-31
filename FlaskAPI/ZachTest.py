import string
import re
import nltk
from nltk.corpus import stopwords
from textblob import TextBlob


fullTextInput = """Title: The Enduring Legacy of William Shakespeare

William Shakespeare, often referred to as the "Bard of Avon," is one of the most celebrated playwrights and poets in the history of literature. His enduring legacy continues to captivate audiences worldwide, transcending time and culture. In this essay, we will explore the life and works of William Shakespeare, his contributions to literature, his influence on the English language, and his lasting impact on the world of theater.

Shakespeare's life is shrouded in mystery, with many gaps in historical records, but he is believed to have been born in Stratford-upon-Avon, England, in 1564. He achieved prominence as an actor and playwright in London during the late 16th and early 17th centuries. His works span a wide range of genres, from tragedy and comedy to history and romance, and he produced timeless masterpieces like "Hamlet," "Romeo and Juliet," and "Macbeth."

One of Shakespeare's most significant contributions to literature is his profound insight into the human condition. His characters are complex and multifaceted, reflecting the intricacies of human emotions, motivations, and relationships. His exploration of universal themes such as love, power, ambition, and betrayal continues to resonate with readers and audiences of all backgrounds. His ability to delve into the human psyche remains unparalleled, making his works a perennial source of introspection and enlightenment.

Shakespeare's influence on the English language is immeasurable. He is credited with coining and popularizing countless words and phrases, many of which are still in use today. Expressions like "break the ice," "wild-goose chase," and "brevity is the soul of wit" originated from his works. His linguistic contributions have left an indelible mark on the evolution of the English language, enriching its vocabulary and providing a lasting source of linguistic creativity.

In addition to his literary and linguistic contributions, Shakespeare's impact on the world of theater is immeasurable. His plays continue to be performed and adapted worldwide, and his theatrical innovations, such as the development of the iambic pentameter and the use of soliloquies, have set enduring standards for dramatic storytelling. The Globe Theatre, where many of his plays were first performed, remains an iconic symbol of the Elizabethan era's theatrical heritage, and it continues to attract theater enthusiasts and scholars from all corners of the globe.

In conclusion, William Shakespeare's legacy is a testament to the enduring power of literature, language, and the performing arts. His works continue to enthrall and inspire, transcending time and cultural boundaries. His profound understanding of the human experience, his contributions to the English language, and his lasting impact on the theater make him an icon in the world of literature and an enduring source of fascination and admiration for generations to come. William Shakespeare's name will forever be synonymous with the pinnacle of literary achievement and the timeless exploration of the human soul."""


class FullText:

    def __init__(self,text):
        self.fullTextString = "uninitializedFull"
        self.wordCount = -1
        self.paragraphList = []

        self.formalityScore = -1 #idk if i want an overall at all.... might be helpful here...
        self.verbosityScore = -1 #idk if i want an overall at all....might be helpful here...
        self.toneScore = -1 #idk if i want an overall at all....individual paragraph tone is more important i think....

        self.fullTextString = text
        self.wordCount = len(self.fullTextString.split()) #full word count

        paragraph_pattern = r'\n\s*\n' #regex to search for 2 end lines in a row
        paragraphTextList = re.split(paragraph_pattern, self.fullTextString)   #splits fulltext into list of paragraphs

        for paraText in paragraphTextList: #loops thru paragraphs
            paraObj_i = Paragraph(paraText) #starts init for paragraph
            self.paragraphList.append(paraObj_i) #adds new paragraph obj to paragraphList




class Paragraph:

    def calculateVerbosity(self):  # average sentence lengths
        self.verbosityScore = self.paraWordCount / len(self.sentenceList)



    def calculateFormality(self):  # look for word lengths in the paragraph.... average what the sentences find for verbosity
        count = len(self.sentenceList)
        total = 0
        for sentence in self.sentenceList:
            total = total + sentence.formalityScore

        self.formalityScore = total/count  #this is bad averaging..."some" (lol) accuracy is lost...I can do it manually here pretty easily though....let me cook



    def calculateTone(self):  # use both nltk VADER and textblob and average (or at least consider both)
        print("loloo")

    def __init__(self, text):
        self.paragraphText = "uninitializedPara"
        self.paraWordCount = -1
        self.sentenceList = []

        self.formalityScore = -1 #average word length stuff (or percent of long words present)
        self.verbosityScore = -1 #average sentence length stuff
        self.toneScore = 9999999 #tone negative - positive

        self.paragraphText = text
        self.paraWordCount = len(self.paragraphText.split()) # para word count

        sentence_pattern = r'(?<=[.!?])\s+'  # regex to search ./?.!
        sentenceTextList = re.split(sentence_pattern, self.paragraphText)  # splits paragraph into list of sentences

        for sentenceText in sentenceTextList:  # loops thru sentences
            sentenceObj_i = Sentence(sentenceText)  # starts init for sentence
            self.sentenceList.append(sentenceObj_i)  # adds new sentence obj to sentenceList

        self.calculateVerbosity()
        self.calculateFormality()
        self.calculateTone()








class Sentence:

    def __init__(self,text):
        self.sentenceText = "uninitializedSente"
        self.sentenceWordCount = -1

        self.formalityScore = -1 #average word length

        self.sentenceText = text
        self.sentenceWordCount = len(self.sentenceText.split())
        self.calculateFormality()

    def calculateFormality(self): #takes average word length after tokenizing to removing stopwords (a, the, is, in...words that don't add much meaning or personality)

        # Tokenize the text
        tokenizedText = nltk.word_tokenize(self.sentenceText)

        # Remove stop words
        filteredSentence = [word for word in tokenizedText if word.lower() not in stopwords.words('english')] #remove punctuation probably...

        # Join the filtered words back into a sentence (didn't end up using, but it could be nice later...
        # filtered_text = ' '.join(filteredSentence)

        letter_counts = [len(word) for word in filteredSentence]

        self.formalityScore = sum(letter_counts) / len(filteredSentence)







testFullText = FullText(fullTextInput)

print(testFullText.wordCount ) #word count of fulltext
print(testFullText.paragraphList[2].paraWordCount) #word count of 3rd paragraph
print(testFullText.paragraphList[1].sentenceList[1].sentenceText) #paragraph 2's second sentence
