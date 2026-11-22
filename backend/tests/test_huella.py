import os

os.environ.setdefault("SUPABASE_URL", "https://teste.supabase.co")
os.environ.setdefault("SUPABASE_KEY", "chave-de-teste")

import pytest
from pydantic import ValidationError

from app.routes.actividades import ActividadIn, Tipo
from app.services.huella import TIPOS, resumir_actividades


def atividade(**campos):
    base = {"estado": "realizada", "participantes": 0, "horas_voluntariado": 0,
            "kg_residuos": 0, "arboles_plantados": 0, "espacio_recuperado": None}
    return {**base, **campos}


# ---------------------------------------------------------------- resumo

def test_sem_atividades():
    assert resumir_actividades([]) == {
        "actividades_realizadas": 0, "actividades_planificadas": 0, "participantes": 0,
        "horas_voluntariado": 0, "kg_residuos": 0, "arboles_plantados": 0, "espacios_recuperados": 0,
    }


def test_soma_so_as_realizadas():
    resumo = resumir_actividades([
        atividade(participantes=10, kg_residuos=25.5, horas_voluntariado=30, arboles_plantados=0),
        atividade(participantes=5, kg_residuos="4.5", horas_voluntariado=10, arboles_plantados=12,
                  espacio_recuperado="Plaza del barrio"),
        atividade(estado="planificada", participantes=99, kg_residuos=99, arboles_plantados=99),
    ])
    assert resumo == {
        "actividades_realizadas": 2, "actividades_planificadas": 1, "participantes": 15,
        "horas_voluntariado": 40.0, "kg_residuos": 30.0, "arboles_plantados": 12, "espacios_recuperados": 1,
    }


def test_espaco_em_branco_nao_conta_como_recuperado():
    resumo = resumir_actividades([atividade(espacio_recuperado="   "), atividade(espacio_recuperado=None)])
    assert resumo["espacios_recuperados"] == 0


def test_valores_nulos_ou_invalidos_viram_zero():
    resumo = resumir_actividades([atividade(participantes=None, kg_residuos="abc")])
    assert resumo["participantes"] == 0 and resumo["kg_residuos"] == 0


# ---------------------------------------------------------------- validação da entrada

def test_tipos_iguais_no_modelo_e_no_servico():
    assert set(Tipo.__args__) == set(TIPOS)


def test_entrada_valida_limpa_textos():
    a = ActividadIn(tipo="limpieza_playa", titulo="  Limpieza de playa  ", fecha="2026-06-08",
                    lugar="", notas="  ", kg_residuos=12.345)
    assert a.titulo == "Limpieza de playa"
    assert a.lugar is None and a.notas is None
    assert a.estado == "planificada"
    assert a.para_banco()["kg_residuos"] == 12.3
    assert a.para_banco()["fecha"] == "2026-06-08"


@pytest.mark.parametrize("campos", [
    {"tipo": "fiesta"},
    {"titulo": "x"},
    {"fecha": "no-es-fecha"},
    {"estado": "cancelada"},
    {"participantes": -1},
    {"kg_residuos": -0.5},
])
def test_entrada_invalida(campos):
    dados = {"tipo": "reforestacion", "titulo": "Plantación", "fecha": "2026-06-28", **campos}
    with pytest.raises(ValidationError):
        ActividadIn(**dados)
