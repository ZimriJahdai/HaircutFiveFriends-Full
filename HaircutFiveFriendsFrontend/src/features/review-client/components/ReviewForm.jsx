import { useEffect, useState } from 'react';

import {
    createReview,
    getAllReviews,
} from '../../../shared/api/review';

import {
    getAllServices,
} from '../../../shared/api/service';

import {
    axiosAdmin,
} from '../../../shared/api/api';

import { StarRating } from './StarRating';



export const ReviewForm = ({
    setReviews,
}) => {
    const [services, setServices] =
        useState([]);
    const [barbers, setBarbers] =
        useState([]);
    const [showForm, setShowForm] =
        useState(false);
    const [saving, setSaving] =
        useState(false);
    const [error, setError] =
        useState('');

    const [success, setSuccess] =
        useState('');
    const [form, setForm] =
        useState({

            score: 5,

            comment: '',

            type: 'barbero',

            targetId: '',

        });

    useEffect(() => {


        Promise.all([

            getAllServices(),

            axiosAdmin
                .get('/barbers')
                .then(res => res.data)

        ])

            .then(([servicesResponse, barbersResponse]) => {


                setServices(
                    servicesResponse.data || []
                );


                setBarbers(
                    barbersResponse.data || []
                );


            })


            .catch(() => { });



    }, []);





    useEffect(() => {


        if (success) {

            const timer =
                setTimeout(() => {

                    setSuccess('');

                }, 4000);


            return () => clearTimeout(timer);

        }


    }, [success]);




    const handleSubmit = async () => {


        if (!form.targetId) {

            setError(
                'Selecciona un barbero o servicio'
            );

            return;

        }



        if (!form.comment.trim()) {


            setError(
                'Escribe un comentario'
            );


            return;

        }




        setSaving(true);

        setError('');



        try {


            const payload = {


                score:
                    form.score,


                comment:
                    form.comment,

            };





            if (form.type === 'barbero') {


                payload.barberoId =
                    form.targetId;


            } else {


                payload.servicioName =
                    services.find(
                        service =>
                            service._id === form.targetId
                    )?.name || '';

            }




            await createReview(payload);




            const response =
                await getAllReviews();



            setReviews(
                response.data || []
            );



            setSuccess(
                '¡Reseña publicada!'
            );



            setShowForm(false);



            setForm({

                score: 5,

                comment: '',

                type: 'barbero',

                targetId: '',

            });



        } catch (error) {


            setError(
                error.response?.data?.message ||
                'Error al publicar reseña'
            );


        } finally {


            setSaving(false);


        }


    };




    return (

        <div>


            <div
                style={{
                    display: 'flex',

                    justifyContent: 'flex-end',

                    marginBottom: '1.5rem',
                }}
            >


                <button

                    onClick={() =>
                        setShowForm(
                            prev => !prev
                        )
                    }


                    style={{
                        background: 'transparent',

                        border:
                            '1px solid #C9A84C',

                        color: '#C9A84C',

                        padding:
                            '8px 16px',

                        borderRadius: '6px',

                        cursor: 'pointer',

                        fontSize: '13px',
                    }}

                >

                    <i
                        className={`ti ${showForm
                                ? 'ti-x'
                                : 'ti-pencil'
                            }`}
                    />

                    {' '}

                    {
                        showForm
                            ? 'Cancelar'
                            : 'Escribir reseña'
                    }


                </button>


            </div>




            {
                success && (

                    <div
                        style={{
                            background: '#152A15',

                            border:
                                '1px solid #205A20',

                            color: '#8E8',

                            padding: '10px',

                            borderRadius: '8px',

                            marginBottom: '15px',

                            fontSize: '12px',
                        }}
                    >

                        <i className="ti ti-check" />

                        {' '}

                        {success}

                    </div>

                )
            }




            {
                showForm && (


                    <div

                        style={{
                            background: '#111',

                            border:
                                '1px solid #2A2A2A',

                            borderRadius: '12px',

                            padding: '1.25rem',

                            marginBottom: '1.5rem',
                        }}

                    >



                        <h3

                            style={{
                                color: '#E8E4DC',

                                marginBottom: '1rem',

                            }}

                        >

                            Nueva reseña

                        </h3>




                        {
                            error && (

                                <div

                                    style={{
                                        background: '#2A1515',

                                        border:
                                            '1px solid #5A2020',

                                        color: '#E88',

                                        padding: '8px',

                                        borderRadius: '6px',

                                        fontSize: '12px',

                                        marginBottom: '12px',
                                    }}

                                >

                                    {error}

                                </div>

                            )
                        }




                        <StarRating

                            value={
                                form.score
                            }

                            onChange={
                                value =>
                                    setForm({
                                        ...form,
                                        score: value
                                    })
                            }

                        />




                        <select

                            value={
                                form.type
                            }


                            onChange={
                                e =>
                                    setForm({

                                        ...form,

                                        type: e.target.value,

                                        targetId: ''

                                    })
                            }


                            style={{
                                width: '100%',

                                marginTop: '15px',

                                background: '#0F0F0F',

                                color: '#E8E4DC',

                                border:
                                    '1px solid #2A2A2A',

                                padding: '10px',

                                borderRadius: '6px',
                            }}

                        >

                            <option value="barbero">
                                Barbero
                            </option>


                            <option value="servicio">
                                Servicio
                            </option>


                        </select>




                        <select


                            value={
                                form.targetId
                            }


                            onChange={
                                e =>
                                    setForm({

                                        ...form,

                                        targetId:
                                            e.target.value

                                    })
                            }



                            style={{
                                width: '100%',

                                marginTop: '10px',

                                background: '#0F0F0F',

                                color: '#E8E4DC',

                                border:
                                    '1px solid #2A2A2A',

                                padding: '10px',

                                borderRadius: '6px',
                            }}

                        >

                            <option value="">
                                Seleccionar...
                            </option>



                            {
                                (
                                    form.type === 'barbero'
                                        ? barbers
                                        : services
                                )
                                    .map(item => (

                                        <option
                                            key={item._id}
                                            value={item._id}
                                        >
                                            {item.name}
                                        </option>

                                    ))
                            }


                        </select>




                        <textarea

                            value={
                                form.comment
                            }


                            onChange={
                                e =>
                                    setForm({

                                        ...form,

                                        comment:
                                            e.target.value

                                    })
                            }



                            placeholder="Cuéntanos tu experiencia..."



                            style={{
                                width: '100%',

                                height: '90px',

                                marginTop: '10px',

                                background: '#0F0F0F',

                                color: '#E8E4DC',

                                border:
                                    '1px solid #2A2A2A',

                                padding: '10px',

                                borderRadius: '6px',

                            }}

                        />




                        <button

                            disabled={saving}


                            onClick={handleSubmit}



                            style={{
                                marginTop: '15px',

                                background: '#C9A84C',

                                color: '#0A0A0A',

                                border: 'none',

                                padding: '9px 20px',

                                borderRadius: '6px',

                                cursor: 'pointer',
                            }}

                        >

                            {
                                saving
                                    ? 'Publicando...'
                                    : 'Publicar reseña'
                            }


                        </button>




                    </div>


                )
            }



        </div>

    );
};
