import {reactive} from "vue";
import supabase from "@/lib/supabase";
import loadQuiz from "@/lib/loadQuiz";

const store = reactive({
    state: 'IDLE',
    quizId: null,
    room: null,
    quiz: null,
    question_finish_at: null,
})

async function createRoom(id) {
    store.quizId = id
    const generatedPin = Math.floor(10000000 + Math.random() * 90000000)
    //todo Проверить пинкод на уникальность
    const {data, error} = await supabase
        .from('room')
        .insert([
            {pin: generatedPin, quiz_id: store.quizId},
        ]).select()
    store.room = data[0]
    store.quiz = await loadQuiz(id)
    store.state = "WAITING"
}
async function startRound(questionIndex) {
    store.question_finish_at = new Date();
    store.question_finish_at.setSeconds(store.question_finish_at.getSeconds() + 15);
    const { data, error } = await supabase
        .from('room')
        .update({ current_question_id: store.quiz.questions[questionIndex].id, question_finish_at: store.question_finish_at })
        .eq('id', store.room.id)

}
export function useQuizHost() {

    return {
        createRoom,
        'store': store,
        startRound
    }
}