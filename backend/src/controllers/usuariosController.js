const supabase = require('../config/database');

class UsuariosController {
    async listar(req, res) {
        try {
            const { data, error } = await supabase
                .from('usuarios')
                .select(`
                    id, 
                    nome, 
                    email, 
                    telefone,
                    ativo,
                    role_id,
                    roles (role_name)
                `)
                .order('nome');
                
            if (error) throw error;
            
            const usuariosMapeados = data.map(u => ({
                id: u.id,
                nome: u.nome,
                email: u.email,
                role_id: u.role_id,
                role_name: u.roles ? u.roles.role_name : 'cliente',
                ativo: u.ativo
            }));
            
            res.json({ sucesso: true, usuarios: usuariosMapeados });
        } catch (error) {
            res.status(500).json({ sucesso: false, erro: error.message });
        }
    }

    async atualizarCargo(req, res) {
        try {
            const { id } = req.params;
            const { role_id } = req.body;
            
            // Checagem de segurança: Só administradores (role_id === 3) podem alterar cargos.
            const { data: requestUser, error: authError } = await supabase
                .from('usuarios')
                .select('role_id')
                .eq('id', req.auth.id)
                .single();
                
            if (authError || !requestUser || requestUser.role_id !== 3) {
                return res.status(403).json({ sucesso: false, erro: 'Acesso negado: Apenas administradores podem alterar cargos.' });
            }

            const { error } = await supabase.from('usuarios')
                .update({ role_id })
                .eq('id', id);
                
            if (error) throw error;
            res.json({ sucesso: true });
        } catch (error) {
            res.status(500).json({ sucesso: false, erro: error.message });
        }
    }
    async perfil(req, res) {
        try {
            const { data, error } = await supabase.from('usuarios').select('id, nome, email, telefone, data_nascimento, foto_perfil').eq('id', req.auth.id).single();
            if (error) throw error;
            res.json({ sucesso: true, usuario: data });
        } catch (error) {
            res.status(500).json({ sucesso: false, erro: error.message });
        }
    }

    async atualizarPerfil(req, res) {
        try {
            const { nome, data_nascimento, foto_perfil, telefone } = req.body;
            console.log("--- RECEBIDO NO BACKEND ---");
            console.log("Nome:", nome);
            console.log("Telefone:", telefone);
            console.log("Foto (tamanho):", foto_perfil ? foto_perfil.length : 0);
            
            const { error } = await supabase.from('usuarios')
                .update({ nome, data_nascimento, foto_perfil, telefone })
                .eq('id', req.auth.id);
                
            if (error) {
                console.error("ERRO SUPABASE:", error);
                throw error;
            }
            
            console.log("PERFIL ATUALIZADO COM SUCESSO NO BANCO!");
            res.json({ sucesso: true });
        } catch (error) {
            console.error("ERRO NO CONTROLLER:", error.message);
            res.status(500).json({ sucesso: false, erro: error.message });
        }
    }

    async listarProfissionais(req, res) {
        try {
            const { data, error } = await supabase.from('usuarios').select('id, nome').eq('role_id', 2).eq('ativo', true);
            if (error) throw error;
            res.json({ sucesso: true, profissionais: data });
        } catch (error) {
            res.status(500).json({ sucesso: false, erro: error.message });
        }
    }
}

module.exports = new UsuariosController();
