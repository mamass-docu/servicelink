import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  Animated,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

const FAQItem = ({ question, answer }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const animation = new Animated.Value(0);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    Animated.timing(animation, {
      toValue: isExpanded ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const rotateArrow = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <TouchableOpacity 
      style={[styles.faqItem, isExpanded && styles.faqItemExpanded]} 
      onPress={toggleExpand}
      activeOpacity={0.7}
    >
      <View style={styles.questionRow}>
        <Text style={styles.question}>{question}</Text>
        <Animated.View style={{ transform: [{ rotate: rotateArrow }] }}>
          <Feather name="chevron-down" size={20} color="#666" />
        </Animated.View>
      </View>
      {isExpanded && (
        <View style={styles.answerContainer}>
          <Text style={styles.answer}>{answer}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const FAQSection = ({ title, questions }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {questions.map((item, index) => (
      <FAQItem key={index} question={item.question} answer={item.answer} />
    ))}
  </View>
);

const FAQScreen = ({ navigation }) => {
  const faqData = {
    general: {
      title: 'General Questions',
      questions: [
        {
          question: '1. What is ServiceLink?',
          answer: 'ServiceLink is a digital platform designed to connect users with local service providers. It integrates various essential services such as plumbing, auto repair, cleaning, and more into a single, user-friendly interface, making service access more efficient.'
        },
        {
          question: '2. What types of services are available on ServiceLink?',
          answer: 'ServiceLink includes a wide range of local services such as cleaning, car washes, massage therapy, auto repairs, plumbing, electrical work, laundry, cellphone and watch repair, and air conditioning services.'
        },
        {
          question: '3. How does ServiceLink improve convenience for users?',
          answer: 'ServiceLink allows users to find, book, and communicate with local service providers easily through a digital platform. It saves time, reduces stress, and enhances accessibility by providing a seamless service experience.'
        }
      ]
    },
    users: {
      title: 'For Users',
      questions: [
        {
          question: '4. How do I access ServiceLink?',
          answer: 'You can access ServiceLink through a mobile app where you can browse available services, book appointments, and communicate with service providers.'
        },
        {
          question: '5. Is there a cost to use ServiceLink as a customer?',
          answer: 'Basic access to browse and book services may be free, but certain premium features or subscription models could be available for added convenience.'
        },
        {
          question: '6. How do I know if a service provider is trustworthy?',
          answer: 'Service providers on ServiceLink are verified, and users can leave reviews and ratings to ensure transparency and quality service.'
        },
        {
          question: '7. Can I book services on short notice?',
          answer: 'Yes, depending on provider availability, you can book immediate or scheduled services through the platform.'
        }
      ]
    },
    providers: {
      title: 'For Service Providers',
      questions: [
        {
          question: '8. How can local businesses join ServiceLink?',
          answer: 'Small to medium-sized service providers can register on the platform by signing up, creating a profile, and listing their services for customers to find.'
        },
        {
          question: '9. How does ServiceLink help businesses grow?',
          answer: 'ServiceLink increases online visibility, improves marketing reach, streamlines transactions, and fosters better communication with customers, helping small businesses expand their customer base.'
        },
        {
          question: '10. Is there a fee for businesses to list their services on ServiceLink?',
          answer: 'ServiceLink may offer free and premium listing options, where premium features could include higher visibility, customer insights, and promotional tools.'
        }
      ]
    },
    technical: {
      title: 'Technical & Security Questions',
      questions: [
        {
          question: '11. Is ServiceLink available in my area?',
          answer: 'Currently, ServiceLink is focused on serving local providers in Pinamalayan, but expansion plans may be considered in the future.'
        },
        {
          question: '12. How does ServiceLink ensure secure transactions?',
          answer: 'The platform implements secure payment methods, encrypted communications, and verified user accounts to ensure safety for both users and providers.'
        },
        {
          question: '13. Can users provide feedback on services?',
          answer: 'Yes, customers can leave ratings and reviews for service providers, helping improve service quality and accountability.'
        }
      ]
    },
    future: {
      title: 'Future Developments',
      questions: [
        {
          question: '14. Will ServiceLink expand to other locations?',
          answer: 'Expansion depends on demand and success in the initial launch area. Future plans may include wider regional coverage.'
        },
        {
          question: '15. Are there any upcoming features?',
          answer: 'Future updates may include AI-based service recommendations, loyalty programs, and enhanced customer support features.'
        }
      ]
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>FAQ</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.mainTitle}>Frequently Asked Questions</Text>
        
        {Object.values(faqData).map((section, index) => (
          <FAQSection 
            key={index}
            title={section.title}
            questions={section.questions}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        paddingTop: 44,
      },
      android: {
        paddingTop: StatusBar.currentHeight,
      },
    }),
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#FFB800',
  },
  faqItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  faqItemExpanded: {
    backgroundColor: '#FFFFFF',
  },
  questionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  question: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    flex: 1,
    marginRight: 16,
  },
  answerContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  answer: {
    fontSize: 14,
    lineHeight: 22,
    color: '#666',
    textAlign: 'justify',
  },
});

export default FAQScreen;
