'use client';
import { useTheme } from '@/context/themeProvider';
import data from '@/data/data.json';
import { useActions, useAppSelector } from '@/hooks/redux';
import { FilterItem } from '@/types/filter.type';
import { CollaborationRequest } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FC, useEffect, useState } from 'react';
import { BackLink, Filters } from '../shared';
import { SearchSelect } from '../UI';
import TabsAuthorship from '../UI/TabsAuthorship';
import styles from './index.module.scss';

const genres = (data as any).genres || [];
const roles = (data as any).roles || [];
const tags = (data as any).tags || [];
const genresData = genres.map((v, i) => ({ colorClass: 'violet', text: v }) as FilterItem);
const rolesData = roles.map((v, i) => ({ colorClass: 'violet', text: v }) as FilterItem);
const tagsData = tags.map((v, i) => ({ colorClass: 'violet', text: v }) as FilterItem);

type CollaborationRequestWithSavedStatus = CollaborationRequest & {
  isSaved: boolean;
  author?: {
    name: string;
  };
  authorId: string;
  createdAt: Date;
};

interface CollaborationResponse {
  id: string;
  message: string;
  status: string;
  files: string[];
  createdAt: string;
  request: {
    id: string;
    title: string;
    author: {
      name: string;
      avatar: string;
    };
  };
  user: {
    name: string;
    avatar: string;
  };
}

interface RequestWithResponses {
  id: string;
  title: string;
  createdAt: string;
  responses: CollaborationResponse[];
}

const AuthorshipComponent: FC = () => {
  const { theme } = useTheme();
  const [flag, setFlag] = useState('./flag.svg');
  const [flagclear, setFlagclear] = useState('./flagcleared.svg');
  const [selectedRoles, setSelectedRoles] = useState<FilterItem[]>([]);
  const [check, setCheck] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const router = useRouter();
  const { toggleFilters } = useActions();
  const { genres, tags } = useAppSelector((state) => state.comics);

  useEffect(() => {
    setFlag(theme === 'dark' ? './flagWhite.svg' : './flag.svg');
    setFlagclear(theme === 'dark' ? './flagWhitecleared.svg' : './flagcleared.svg');
  }, [theme]);

  const isFormValid =
    title.trim() !== '' &&
    description.trim() !== '' &&
    selectedRoles.length > 0 &&
    genres.length > 0 &&
    tags.length > 0;

  const handleSave = () => {
    if (isFormValid) {
      setCheck(true);
    }
  };

  const handleConfirm = async () => {
    try {
      const response = await fetch('/api/comics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          isCollaborationRequest: true,
          roles: selectedRoles.map((role) => role.text),
          genres: genres.map((g) => g.text),
          tags: tags.map((t) => t.text),
          covers: [],
          banner: '',
        }),
      });

      if (!response.ok) throw new Error('Ошибка при создании комикса');

      const updatedResponse = await fetch('/api/comics?type=requests');
      const updatedData = await updatedResponse.json();
      setRequests(updatedData);

      setTitle('');
      setDescription('');
      setSelectedRoles([]);
      setCheck(false);
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Произошла ошибка при сохранении');
    }
  };
  const { data: session } = useSession();
  const [requests, setRequests] = useState<CollaborationRequestWithSavedStatus[]>([]);
  const [requestsMy, setRequestsMy] = useState<CollaborationRequestWithSavedStatus[]>([]);
  const [savedRequests, setSavedRequests] = useState<CollaborationRequestWithSavedStatus[]>([]);
  const [activeWin, setActiveWin] = useState<number>(0);

  const [filters, setFilters] = useState({
    roles: [] as string[],
    tags: [] as string[],
    genres: [] as string[],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const requestsResponse = await fetch('/api/comics?type=requests');
        if (!requestsResponse.ok) throw new Error('Failed to fetch requests');
        const requestsData = await requestsResponse.json();

        const myRequestsResponse = await fetch('/api/comics?type=requests&myRequests=true');
        const myRequestsData = await myRequestsResponse.json();
        setRequestsMy(myRequestsData);

        if (!session?.user?.id) {
          setRequests(requestsData.map((request: any) => ({ ...request, isSaved: false })));
          setSavedRequests([]);
          return;
        }

        try {
          const savedResponse = await fetch(`/api/users/${session.user.id}/saved`);
          if (!savedResponse.ok) throw new Error('Failed to fetch saved requests');

          const savedData = await savedResponse.json();
          const savedRequestIds = savedData.map((item: any) => item.requestId);

          const savedComics = requestsData
            .filter((request: any) => savedRequestIds.includes(request.id))
            .map((request: any) => ({ ...request, isSaved: true }));

          setSavedRequests(savedComics);

          const requestsWithSavedStatus = requestsData.map((request: any) => ({
            ...request,
            isSaved: savedRequestIds.includes(request.id),
          }));

          setRequests(requestsWithSavedStatus);
          if (session?.user?.id) {
            await fetchMyResponses();
            await fetchReceivedResponses();
          }
        } catch (savedError) {
          console.error('Error fetching saved requests:', savedError);
          setRequests(requestsData.map((request: any) => ({ ...request, isSaved: false })));
          setSavedRequests([]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [check, session?.user?.id]);

  const handleSaveComics = async (requestId: string, isSaved: boolean) => {
    try {
      if (!session?.user?.id) return;

      const response = await fetch(`/api/users/${session.user.id}/saved`, {
        method: isSaved ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId }),
      });

      if (!response.ok) {
        throw new Error('Failed to save request');
      }

      setRequests((prev) => prev.map((req) => (req.id === requestId ? { ...req, isSaved: !isSaved } : req)));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const [selectedComic, setSelectedComic] = useState<CollaborationRequestWithSavedStatus | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleComicClick = (comic: CollaborationRequestWithSavedStatus) => {
    setSelectedComic(comic);
    setIsModalOpen(true);
  };

  const [myResponses, setMyResponses] = useState<CollaborationResponse[]>([]);
  const [receivedResponses, setReceivedResponses] = useState<RequestWithResponses[]>([]);

  const fetchMyResponses = async () => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch(`/api/users/${session.user.id}/responses`);
      if (response.ok) {
        const data = await response.json();
        setMyResponses(data);
      }
    } catch (error) {
      console.error('Error fetching my responses:', error);
    }
  };

  const fetchReceivedResponses = async () => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch(`/api/users/${session.user.id}/received-responses`);
      if (response.ok) {
        const data = await response.json();
        setReceivedResponses(data);
      }
    } catch (error) {
      console.error('Error fetching received responses:', error);
    }
  };

  useEffect(() => {
    fetchMyResponses();
    fetchReceivedResponses();
  }, [session?.user?.id, check]);

  const handleResponseStatus = async (responseId: string, status: string) => {
    try {
      const response = await fetch(`/api/collaboration-responses/${responseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Ошибка при обновлении статуса');
      }

      alert('Статус обновлен');
      fetchReceivedResponses();
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Произошла ошибка при обновлении статуса');
    }
  };

  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);
  const [selectedRequestForResponse, setSelectedRequestForResponse] =
    useState<CollaborationRequestWithSavedStatus | null>(null);
  const [selectedRolesForResponse, setSelectedRolesForResponse] = useState<FilterItem[]>([]);
  const [responseMessage, setResponseMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleOpenResponseModal = (request: CollaborationRequestWithSavedStatus) => {
    setSelectedRequestForResponse(request);
    setIsResponseModalOpen(true);
  };

  const handleSendResponse = async (requestId: string) => {
    try {
      if (!responseMessage || responseMessage.trim().length === 0) {
        alert('Вступительное сообщение обязательно');
        return;
      }

      if (responseMessage.trim().length < 10) {
        alert('Вступительное сообщение должно содержать не менее 10 символов');
        return;
      }

      setIsUploading(true);

      const formData = new FormData();
      formData.append('message', responseMessage);

      selectedFiles.forEach((file) => {
        formData.append('files', file);
      });

      const response = await fetch(`/api/collaboration-requests/${requestId}/responses`, {
        method: 'POST',
        body: formData,
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Ошибка при отправке отклика');
      }

      alert('Отклик успешно отправлен!');
      setIsResponseModalOpen(false);

      setSelectedFiles([]);
      setResponseMessage('');

      fetchMyResponses();
    } catch (error) {
      console.error('Ошибка:', error);
      alert(error.message || 'Произошла ошибка при отправке отклика');
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    const validFiles = files.filter((file) => {
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];

      const maxSize = 10 * 1024 * 1024; // 10MB

      if (!allowedTypes.includes(file.type)) {
        alert(`Файл ${file.name} не поддерживается. Разрешены только .doc, .docx, .pdf`);
        return false;
      }

      if (file.size > maxSize) {
        alert(`Файл ${file.name} слишком большой. Максимальный размер - 10MB`);
        return false;
      }

      return true;
    });

    setSelectedFiles((prev) => [...prev, ...validFiles]);
  };
  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'На рассмотрении';
      case 'ACCEPTED':
        return 'Принято';
      case 'REJECTED':
        return 'Отклонено';
      default:
        return status;
    }
  };
  return (
    <div className={styles['authorship']}>
      {isModalOpen ? (
        <>
          <button className={styles['link']} onClick={() => setIsModalOpen(false)}>
            <svg
              className={styles['arrow']}
              width="6"
              height="8"
              viewBox="0 0 6 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1.40512e-06 4C-0.000667787 3.50964 0.237712 3.0361 0.670052 2.66894C0.92934 2.44989 1.1815 2.24222 1.36238 2.10624L3.87863 0.18166C4.04632 0.0632194 4.26845 -0.00186189 4.49852 4.05637e-05C4.72859 0.00194301 4.94876 0.0706814 5.11295 0.191867C5.27713 0.313052 5.3726 0.477288 5.37936 0.650194C5.38612 0.823099 5.30366 0.991269 5.14923 1.1195L2.62852 3.04876C2.4619 3.1747 2.23558 3.36227 2.00481 3.55721C1.86123 3.67958 1.782 3.83715 1.782 4.00033C1.782 4.16352 1.86123 4.32109 2.00481 4.44346C2.23469 4.63773 2.46101 4.8253 2.62229 4.94722L5.14923 6.8805C5.30366 7.00873 5.38612 7.1769 5.37936 7.34981C5.3726 7.52271 5.27713 7.68695 5.11295 7.80813C4.94876 7.92932 4.72859 7.99806 4.49852 7.99996C4.26845 8.00186 4.04632 7.93678 3.87863 7.81834L1.35792 5.89041C1.17972 5.75644 0.930231 5.55078 0.672725 5.3324C0.238792 4.96529 -0.000616351 4.49112 1.40512e-06 4Z"
                fill="#7A5AF8"
              />
            </svg>
            Вернуться назад
          </button>
        </>
      ) : (
        <>
          <BackLink />
        </>
      )}
      <TabsAuthorship mixClass={[styles['tabs__items']]} tabs={['Комиксы', 'Мои комиксы', 'Новый комикс']}>
        {isModalOpen ? (
          <>
            {isModalOpen && selectedComic && (
              <div className={styles['modal__overlay']} onClick={() => setIsModalOpen(false)}>
                <div onClick={(e) => e.stopPropagation()}>
                  <div className={styles['modal__section']}>
                    <h2 className={styles['modal__title']}>{selectedComic.title}</h2>
                    <img src="./share.svg" alt="share" />
                  </div>
                  <div className={styles['modal__section']}>
                    <div className={styles['modal__section--tags']}>
                      {selectedComic.roles.map((role) => (
                        <span key={role} className={styles['role-tag']}>
                          {role}
                        </span>
                      ))}
                    </div>
                    <p className={styles['modal__date']}>
                      {selectedComic.author?.name || 'Неизвестен'},{' '}
                      {new Date(selectedComic.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className={styles['modal__buttons']}>
                    {selectedComic.authorId !== session?.user?.id && (
                      <button
                        className={styles['modal__buttons--apply']}
                        onClick={() => handleOpenResponseModal(selectedComic)}
                      >
                        Отправить отклик
                      </button>
                    )}

                    <button
                      className={styles['modal__buttons--save']}
                      onClick={() => {
                        handleSaveComics(selectedComic.id, selectedComic.isSaved);
                      }}
                    >
                      {selectedComic.isSaved ? 'Удалить' : 'Сохранить'}
                    </button>
                  </div>

                  <h2 className={styles['modal__titledes']}>Описание</h2>
                  <p className={styles['modal__description']}>{selectedComic.description}</p>

                  <div className={styles['modal__tags-section']}>
                    <h3 className={styles['preview-label']}>Теги:</h3>
                    <div className={styles['modal__tags']}>
                      {selectedComic.tags.map((tag) => (
                        <span key={tag} className={styles['tag']}>
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className={styles['modal__tags-section']}>
                    <h3 className={styles['preview-label']}>Жанры:</h3>
                    <div className={styles['modal__tags']}>
                      {selectedComic.genres.map((genre) => (
                        <span key={genre} className={styles['genre']}>
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {isResponseModalOpen && selectedRequestForResponse && (
              <div className={styles['response-modal__overlay']} onClick={() => setIsResponseModalOpen(false)}>
                <div onClick={(e) => e.stopPropagation()} className={styles['response-modal__content']}>
                  <div className={styles['response-modal__header']}>
                    <h2 className={styles['response-modal__h2']}>Подать заявку</h2>
                    <button className={styles['response-modal__close']} onClick={() => setIsResponseModalOpen(false)}>
                      ×
                    </button>
                  </div>

                  <div className={styles['response-modal__form']}>
                    <div className={styles['response-modal__section']}>
                      <label className={styles['response-modal__label']}>Вступительное сообщение</label>
                      <textarea
                        placeholder="Напишите почему вы хотите стать соавтором"
                        value={responseMessage}
                        onChange={(e) => setResponseMessage(e.target.value)}
                        className={styles['response-modal__textarea']}
                        rows={4}
                      />
                    </div>
                    <h1 className={styles['file__hint']}>Примеры работ (опционально)</h1>
                    <p>Загрузите примеры своих работ, если считаете необходимым</p>
                    <span className={styles['file__hint']}>Загрузить из файла .doc .docx .pdf (макс. 10MB)</span>
                    <div className={styles['file__upload']}>
                      <label className={styles['file__label']}>
                        Выбрать
                        <input
                          type="file"
                          multiple
                          accept=".doc,.docx,.pdf"
                          onChange={handleFileSelect}
                          className={styles['file__input']}
                        />
                      </label>{' '}
                      {selectedFiles.length === 0 && <>Файл не выбран</>}
                      {selectedFiles.length > 0 && (
                        <div className={styles['selected-files__list']}>
                          <strong>Выбранные файлы:</strong>
                          {selectedFiles.map((file, index) => (
                            <div key={index} className={styles['file__item']}>
                              <span className={styles['file__name']}>📄 {file.name}</span>
                              <span className={styles['file__size']}>({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                              <div onClick={() => removeFile(index)} className={styles['file__remove']}>
                                ×
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className={styles['response-modal__actions']}>
                      <button
                        className={styles['response-modal__cancel']}
                        onClick={() => setIsResponseModalOpen(false)}
                      >
                        Отмена
                      </button>
                      <button
                        className={styles['response-modal__submit']}
                        onClick={() => handleSendResponse(selectedComic.id)}
                        disabled={
                          isUploading ||
                          !responseMessage.trim() ||
                          responseMessage.trim().length < 10 ||
                          selectedFiles.length === 0
                        }
                      >
                        {isUploading ? 'Отправка...' : 'Отправить отклик'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="">
              <div className={styles['authorship__text']}>
                Показано:
                <span> {requests.length} комиксов</span>
              </div>
              <div className={styles['authorship__comics']}>
                <div className={styles['authorship__comics--first']}>
                  <Filters
                    filters={[
                      {
                        text: 'Роль',
                        colorClass: 'tags',
                        filters: rolesData.map((role) => role.text),
                        filterType: 'search',
                        isActive: false,
                      },
                      {
                        text: 'Теги',
                        colorClass: 'tags',
                        filters: tagsData.map((tag) => `#${tag.text}`),
                        filterType: 'search',
                        isActive: false,
                      },
                      {
                        text: 'Жанр',
                        colorClass: 'tags',
                        filters: genresData.map((genre) => genre.text),
                        filterType: 'search',
                        isActive: false,
                      },
                    ]}
                    mixClass={[styles['catalog__filter']]}
                  />
                </div>
                <div className={styles['authorship__comics--two']}>
                  {requests && requests.length > 0 ? (
                    <>
                      {requests?.map((request) => (
                        <div
                          key={request.id}
                          className={styles['authorship__comics--two__view']}
                          onClick={() => handleComicClick(request)}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className={styles['authorship__view']}>
                            <p>{request.title}</p>
                            <div className="">
                              <img
                                src={request.isSaved ? flagclear : flag}
                                alt="flag"
                                className={styles['authorship__view--flag']}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSaveComics(request.id, request.isSaved);
                                }}
                                style={{
                                  cursor: 'pointer',
                                  filter: request.isSaved ? 'grayscale(0)' : 'grayscale(1)',
                                  opacity: request.isSaved ? 1 : 0.5,
                                }}
                              />
                            </div>
                          </div>
                          <p>{request.roles.join(', ')}</p>

                          <div className={styles['modal__tags']}>
                            {request.genres.slice(0, 4).map((genre) => (
                              <span key={genre} className={styles['tag']}>
                                #{genre}
                              </span>
                            ))}
                          </div>
                          <div className={styles['modal__tags']}>
                            {request.genres.slice(0, 4).map((tag) => (
                              <span key={tag} className={styles['tag']}>
                                #{tag}
                              </span>
                            ))}
                          </div>
                          <p>{new Date(request.createdAt).toLocaleDateString()}</p>
                        </div>
                      ))}
                    </>
                  ) : (
                    <h1 className={styles['authorship__null']}>Список пуст :(</h1>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
        <div className="">
          <div className={styles['authorship__button']}>
            <img src="./edit.svg" alt="edit" />
            <p>Создать новую заявку</p>
          </div>
          <div className={styles['authorship__comics']}>
            <div className={styles['authorship__mycomics--first']}>
              <h1
                onClick={() => {
                  setActiveWin(0);
                }}
                className={styles['authorship__mycomics--buttonfirst']}
              >
                Мои комиксы
              </h1>
              <h1
                onClick={() => {
                  setActiveWin(1);
                }}
                className={styles['authorship__mycomics--buttontwo']}
              >
                Сохранённые комиксы
              </h1>
              <h1
                onClick={() => {
                  setActiveWin(2);
                }}
                className={styles['authorship__mycomics--buttonfirst']}
              >
                Заявки
              </h1>
              <h1
                onClick={() => {
                  setActiveWin(3);
                }}
                className={styles['authorship__mycomics--buttontwo']}
              >
                Отклики
              </h1>
            </div>

            <div className={styles['authorship__comics--two']}>
              {activeWin === 0 ? (
                <>
                  {requestsMy && requestsMy.length > 0 ? (
                    <>
                      {requestsMy?.map((request) => (
                        <div key={request.id} className={styles['authorship__comics--two__view']}>
                          <div className={styles['authorship__view']}>
                            <p>{request.title}</p>
                            <div className="">
                              <img
                                src={request.isSaved ? flagclear : flag}
                                alt="flag"
                                className={styles['authorship__view--flag']}
                                style={{ cursor: 'pointer' }}
                              />
                            </div>
                          </div>
                          <p>{request.roles.join(', ')}</p>
                          <div className={styles['modal__tags']}>
                            {request.genres.slice(0, 4).map((genre) => (
                              <span key={genre} className={styles['tag']}>
                                #{genre}
                              </span>
                            ))}
                          </div>
                          <div className={styles['modal__tags']}>
                            {request.genres.slice(0, 4).map((tag) => (
                              <span key={tag} className={styles['tag']}>
                                #{tag}
                              </span>
                            ))}
                          </div>
                          <p>{new Date(request.createdAt).toLocaleDateString()}</p>
                        </div>
                      ))}
                    </>
                  ) : (
                    <h1 className={styles['authorship__null']}>Список пуст :(</h1>
                  )}
                </>
              ) : activeWin === 1 ? (
                <>
                  {savedRequests && savedRequests.length > 0 ? (
                    savedRequests.map((request) => (
                      <div key={request.id} className={styles['authorship__comics--two__view']}>
                        <div className={styles['authorship__view']}>
                          <p>{request.title}</p>
                          <div className="">
                            <img
                              src={request.isSaved ? flagclear : flag}
                              alt="flag"
                              className={styles['authorship__view--flag']}
                              onClick={() => handleSaveComics(request.id, request.isSaved)}
                              style={{
                                cursor: 'pointer',
                                filter: request.isSaved ? 'grayscale(0)' : 'grayscale(1)',
                                opacity: request.isSaved ? 1 : 0.5,
                              }}
                            />
                          </div>
                        </div>
                        <p>{request.roles.join(', ')}</p>
                        <div className={styles['modal__tags']}>
                          {request.genres.slice(0, 4).map((genre) => (
                            <span key={genre} className={styles['tag']}>
                              #{genre}
                            </span>
                          ))}
                        </div>
                        <div className={styles['modal__tags']}>
                          {request.genres.slice(0, 4).map((tag) => (
                            <span key={tag} className={styles['tag']}>
                              #{tag}
                            </span>
                          ))}
                        </div>
                        <p>{new Date(request.createdAt).toLocaleDateString()}</p>
                      </div>
                    ))
                  ) : (
                    <h1 className={styles['authorship__null']}>Список пуст :(</h1>
                  )}
                </>
              ) : activeWin === 2 ? (
                <>
                  {myResponses.length > 0 ? (
                    <div className={styles['responses-list']}>
                      {myResponses.map((response) => (
                        <div key={response.id} className={styles['authorship__comics--two__view']}>
                          <div className={styles['response-header']}>
                            <h3 className={styles['response-project']}>Проект: {response.request.title}</h3>
                            <span
                              className={`${styles['response-status']} ${styles[`status-${response.status.toLowerCase()}`]}`}
                            >
                              {getStatusText(response.status)}
                            </span>
                          </div>

                          <div className={styles['response-message']}>
                            <strong>Мое сообщение:</strong>
                            <p>{response.message}</p>
                          </div>

                          {response.files && response.files.length > 0 && (
                            <div className={styles['response-files']}>
                              <strong>Прикрепленные файлы:</strong>
                              <div className={styles['files-list']}>
                                {response.files.map((fileUrl, index) => (
                                  <a
                                    key={index}
                                    href={fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles['file-link']}
                                  >
                                    📄 Файл {index + 1}
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className={styles['response-footer']}>
                            <span className={styles['response-date']}>
                              Отправлено: {new Date(response.createdAt).toLocaleDateString('ru-RU')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={styles['empty-state']}>
                      <p>У вас пока нет отправленных откликов</p>
                    </div>
                  )}
                </>
              ) : activeWin === 3 ? (
                <>
                  {receivedResponses.length > 0 ? (
                    <div className={styles['requests-list']}>
                      {receivedResponses.map((request) => (
                        <div key={request.id} className={styles['authorship__comics--two__view']}>
                          <div className={styles['request-header']}>
                            <h3 className={styles['request-title']}>{request.title}</h3>
                            <span className={styles['request-date']}>
                              Создана: {new Date(request.createdAt).toLocaleDateString('ru-RU')}
                            </span>
                          </div>

                          {request.responses.length > 0 ? (
                            <div className={styles['responses-container']}>
                              <h4>Отклики ({request.responses.length}):</h4>
                              {request.responses.map((response) => (
                                <div key={response.id} className={styles['received-response']}>
                                  <div className={styles['response-user']}>
                                    <img
                                      src={response.user.avatar || '/default-avatar.png'}
                                      alt={response.user.name}
                                      className={styles['user-avatar']}
                                    />
                                    <span className={styles['user-name']}>{response.user.name}</span>
                                  </div>

                                  <div className={styles['response-content']}>
                                    <div className={styles['response-message']}>
                                      <strong>Сообщение:</strong>
                                      <p>{response.message}</p>
                                    </div>

                                    {response.files && response.files.length > 0 && (
                                      <div className={styles['response-files']}>
                                        <strong>Примеры работ:</strong>
                                        <div className={styles['files-list']}>
                                          {response.files.map((fileUrl, index) => (
                                            <a
                                              key={index}
                                              href={fileUrl}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className={styles['file-link']}
                                            >
                                              📄 Файл {index + 1}
                                            </a>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  <div className={styles['response-actions']}>
                                    <span
                                      className={`${styles['response-status']} ${styles[`status-${response.status.toLowerCase()}`]}`}
                                    >
                                      Статус: {getStatusText(response.status)}
                                    </span>

                                    {response.status === 'PENDING' && (
                                      <div className={styles['action-buttons']}>
                                        <button
                                          onClick={() => handleResponseStatus(response.id, 'ACCEPTED')}
                                          className={styles['accept-btn']}
                                        >
                                          Принять
                                        </button>
                                        <button
                                          onClick={() => handleResponseStatus(response.id, 'REJECTED')}
                                          className={styles['reject-btn']}
                                        >
                                          Отклонить
                                        </button>
                                      </div>
                                    )}
                                  </div>

                                  <div className={styles['response-footer']}>
                                    <span className={styles['response-date']}>
                                      Отправлен: {new Date(response.createdAt).toLocaleDateString('ru-RU')}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className={styles['no-responses']}>
                              <p>Пока нет откликов на эту заявку</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={styles['empty-state']}>
                      <p>На ваши заявки пока нет откликов</p>
                    </div>
                  )}
                </>
              ) : null}
            </div>
          </div>
        </div>
        <div className={styles['authorship__new-comics']}>
          {!check ? (
            <>
              <div className={styles['authorship__form']}>
                <div className={styles['authorship__form-group']}>
                  <label className={styles['authorship__label']}>Название</label>
                  <input
                    className={styles['authorship__input']}
                    placeholder="Введите название комикса"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className={styles['authorship__form-group']}>
                  <label className={styles['authorship__label']}>Описание</label>
                  <textarea
                    className={styles['authorship__textarea']}
                    placeholder="Опишите ваш комикс и идею для соавторов"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className={styles['authorship__roles']}>
                  <SearchSelect
                    multiple={true}
                    title="Выберите роли для соавторов"
                    searchTitle="Поиск ролей"
                    data={rolesData}
                    state={selectedRoles}
                    toggleFilters={(el) => {
                      setSelectedRoles((prev) =>
                        prev.some((item) => item.text === el.text)
                          ? prev.filter((item) => item.text !== el.text)
                          : [...prev, el],
                      );
                    }}
                  />
                </div>

                <div className={styles['authorship__selectors']}>
                  <SearchSelect
                    multiple={true}
                    title="Выберите жанры"
                    searchTitle="Поиск жанра"
                    data={genresData}
                    state={genres}
                    toggleFilters={(el) => toggleFilters({ type: 'genres', element: el })}
                  />

                  <SearchSelect
                    multiple={true}
                    title="Выберите теги"
                    searchTitle="Поиск по тегам"
                    data={tagsData}
                    state={tags}
                    toggleFilters={(el) => toggleFilters({ type: 'tags', element: el })}
                  />
                </div>
              </div>

              <div className={styles['authorship__actions']}>
                <button className={styles['authorship__save-btn']} onClick={handleSave} disabled={!isFormValid}>
                  Сохранить
                </button>
                <button className={styles['authorship__cancel-btn']} onClick={() => router.back()}>
                  Отмена
                </button>
              </div>
            </>
          ) : (
            <div className={styles['authorship__preview']}>
              <h3 className={styles['authorship__preview-title']}>Проверьте данные перед созданием заявки</h3>
              <div className={styles['authorship__preview-content']}>
                <div className={styles['preview-row']}>
                  <span className={styles['preview-label']}>Тип:</span>
                  <span>Заявка на соавторство</span>
                </div>
                <div className={styles['preview-row']}>
                  <span className={styles['preview-label']}>Название:</span>
                  <span>{title}</span>
                </div>
                <div className={styles['preview-row']}>
                  <span className={styles['preview-label']}>Описание:</span>
                  <span>{description}</span>
                </div>
                <div className={styles['preview-row']}>
                  <span className={styles['preview-label']}>Ищем:</span>
                  <div className={styles['preview-tags']}>
                    {selectedRoles.map((role) => (
                      <span key={role.text} className={styles['preview-tag']}>
                        {role.text}
                      </span>
                    ))}
                  </div>
                </div>
                <div className={styles['preview-row']}>
                  <span className={styles['preview-label']}>Жанры:</span>
                  <div className={styles['preview-tags']}>
                    {genres.map((genre) => (
                      <span key={genre.text} className={styles['preview-tag']}>
                        {genre.text}
                      </span>
                    ))}
                  </div>
                </div>
                <div className={styles['preview-row']}>
                  <span className={styles['preview-label']}>Теги:</span>
                  <div className={styles['preview-tags']}>
                    {tags.map((tag) => (
                      <span key={tag.text} className={styles['preview-tag']}>
                        {tag.text}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className={styles['authorship__preview-actions']}>
                <button className={styles['authorship__confirm-btn']} onClick={handleConfirm}>
                  Создать заявку
                </button>
                <button className={styles['authorship__edit-btn']} onClick={() => setCheck(false)}>
                  Редактировать
                </button>
              </div>
            </div>
          )}
        </div>
      </TabsAuthorship>
    </div>
  );
};

export default AuthorshipComponent;
