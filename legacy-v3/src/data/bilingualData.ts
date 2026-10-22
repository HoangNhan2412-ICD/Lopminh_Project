import { BilingualTerm, ClassroomCommand } from '@/types/sanctuary';

export const initialClassroomCommands: ClassroomCommand[] = [
  {
    id: 'cmd-01',
    category: 'opening',
    vietnamese: 'Xin mời cả lớp hướng mắt lên màn hình/bảng.',
    english: 'Please look at the board, everyone.',
    ipa: '/pliːz lʊk æt ðə bɔːd, ˈevriwʌn/',
    pronounceText: 'Please look at the board, everyone',
    situation: 'Dùng khi bắt đầu chuyển giao nhiệm vụ hoặc muốn học sinh ngừng làm việc riêng'
  },
  {
    id: 'cmd-02',
    category: 'activity',
    vietnamese: 'Các em hãy thảo luận theo cặp trong vòng 3 phút.',
    english: 'Work in pairs for three minutes.',
    ipa: '/wɜːk ɪn peəz fɔː θriː ˈmɪnɪts/',
    pronounceText: 'Work in pairs for three minutes',
    situation: 'Dùng khi bắt đầu Hoạt động Hình thành kiến thức hoặc Luyện tập'
  },
  {
    id: 'cmd-03',
    category: 'activity',
    vietnamese: 'Em nào có thể xung phong lên bảng chia sẻ cách làm?',
    english: 'Who can volunteer to show the answer on the board?',
    ipa: '/huː kæn ˌvɒlənˈtɪə tuː ʃəʊ ði ˈɑːnsər ɒn ðə bɔːd/',
    pronounceText: 'Who can volunteer to show the answer on the board?',
    situation: 'Khơi gợi tinh thần tự giác, không gây áp lực sợ sai'
  },
  {
    id: 'cmd-04',
    category: 'encouragement',
    vietnamese: 'Rất xuất sắc! Cả lớp hãy dành một tràng pháo tay cho bạn.',
    english: 'Excellent job! Let us give him a big round of applause.',
    ipa: '/ˈeksələnt dʒɒb! let ʌs ɡɪv hɪm ə bɪɡ raʊnd əv əˈplɔːz/',
    pronounceText: 'Excellent job! Let us give him a big round of applause',
    situation: 'Khen ngợi học sinh sau khi giải bài khó hoặc có bước tiến bộ'
  },
  {
    id: 'cmd-05',
    category: 'closing',
    vietnamese: 'Thời gian đã hết, chúng ta cùng kiểm tra đáp án nhé.',
    english: 'Time is up! Let us check the result together.',
    ipa: '/taɪm ɪz ʌp! let ʌs tʃek ðə rɪˈzʌlt təˈɡeðər/',
    pronounceText: 'Time is up! Let us check the result together',
    situation: 'Kết thúc thời gian làm bài nhóm/cá nhân'
  }
];

export const initialBilingualTerms: BilingualTerm[] = [
  {
    id: 'term-toan-01',
    subject: 'Toan',
    topic: 'Đại số & Phương trình',
    vietnamese: 'Hệ phương trình bậc nhất hai ẩn',
    english: 'System of linear equations in two variables',
    ipa: '/ˈsɪstəm əv ˈlɪniər ɪˈkweɪʒənz ɪn tuː ˈveəriəblz/',
    exampleSentenceVi: 'Hôm nay chúng ta sẽ tìm nghiệm của hệ phương trình bậc nhất hai ẩn.',
    exampleSentenceEn: 'Today we will solve a system of linear equations in two variables.',
    pronounceText: 'System of linear equations in two variables',
    usageContext: 'Bài 2 Toán 9 - Sách Kết nối tri thức'
  },
  {
    id: 'term-toan-02',
    subject: 'Toan',
    topic: 'Hình học',
    vietnamese: 'Tam giác vuông & Cạnh huyền',
    english: 'Right-angled triangle and Hypotenuse',
    ipa: '/raɪt ˈæŋɡld ˈtraɪæŋɡl ænd haɪˈpɒtənjuːz/',
    exampleSentenceVi: 'Cạnh đối diện góc vuông gọi là cạnh huyền.',
    exampleSentenceEn: 'The side opposite the right angle is called the hypotenuse.',
    pronounceText: 'Right angled triangle and Hypotenuse',
    usageContext: 'Hệ thức lượng trong tam giác vuông'
  },
  {
    id: 'term-khtn-01',
    subject: 'KHTN',
    topic: 'Vật lý - Cơ học',
    vietnamese: 'Vận tốc và Gia tốc trọng trường',
    english: 'Velocity and Gravitational acceleration',
    ipa: '/vəˈlɒsəti ænd ˌɡrævɪˈteɪʃənl əkˌseləˈreɪʃən/',
    exampleSentenceVi: 'Vật rơi tự do dưới tác dụng của gia tốc trọng trường.',
    exampleSentenceEn: 'The object falls freely under the gravitational acceleration.',
    pronounceText: 'Velocity and Gravitational acceleration',
    usageContext: 'Chủ đề Chuyển động trong KHTN 9'
  },
  {
    id: 'term-khtn-02',
    subject: 'KHTN',
    topic: 'Hóa học',
    vietnamese: 'Phản ứng tỏa nhiệt & Phản ứng thu nhiệt',
    english: 'Exothermic reaction and Endothermic reaction',
    ipa: '/ˌeksəʊˈθɜːmɪk riˈækʃn ænd ˌendəʊˈθɜːmɪk riˈækʃn/',
    exampleSentenceVi: 'Khi đốt cháy than, phản ứng tỏa ra một lượng nhiệt lớn.',
    exampleSentenceEn: 'When coal burns, it is an exothermic reaction.',
    pronounceText: 'Exothermic reaction and Endothermic reaction',
    usageContext: 'Bài Biến thiên enthalpy KHTN 9'
  },
  {
    id: 'term-sinh-01',
    subject: 'SinhHoc',
    topic: 'Di truyền học',
    vietnamese: 'Gen trội và Gen lặn',
    english: 'Dominant gene and Recessive gene',
    ipa: '/ˈdɒmɪnənt dʒiːn ænd rɪˈsesɪv dʒiːn/',
    exampleSentenceVi: 'Quy luật phân ly của Men-đen giải thích tính trạng trội và lặn.',
    exampleSentenceEn: 'Mendel laws explain dominant and recessive genes.',
    pronounceText: 'Dominant gene and Recessive gene',
    usageContext: 'Chương Di truyền học Men-đen'
  },
  {
    id: 'term-su-01',
    subject: 'LichSu',
    topic: 'Lịch sử Việt Nam',
    vietnamese: 'Cách mạng tháng Tám năm 1945',
    english: 'The August Revolution of 1945',
    ipa: '/ði ˈɔːɡəst ˌrevəˈluːʃn əv naɪnˈtiːn fɔːti faɪv/',
    exampleSentenceVi: 'Cách mạng tháng Tám là mốc son chói lọi trong lịch sử dân tộc.',
    exampleSentenceEn: 'The August Revolution of 1945 is a glorious milestone in Vietnamese history.',
    pronounceText: 'The August Revolution of 1945',
    usageContext: 'Lịch sử 9'
  }
];
